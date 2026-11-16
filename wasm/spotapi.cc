// -*- coding: utf-8 -*-
// Copyright (C) 2026 Laboratoire de Recherche et Développement de l'Epita.
//
// This application is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation; either version 3 of the
// License, or (at your option) any later version.
//
// This application is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// A port of server/spotapi.py to C++, so that the API can be compiled
// to WebAssembly and run inside the browser instead of on a server.
//
// The single entry point, spotapi(), takes the URL the client would
// have fetched (e.g. "/api/translate/GFa?a=b&l=m") and returns
// {"status": N, "body": ...}, where body is what spotapi.py would have
// answered.  The only difference is that GraphViz is not available
// here: where spotapi.py returns an SVG rendered by dot, we return the
// dot source in a key ending in "_dot", and the JavaScript side
// (client/src/api/local/) renders it.  See README.wasm for details.

#include <chrono>
#include <cstdlib>
#include <memory>
#include <map>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include <spot/misc/version.hh>
#include <spot/tl/delta2.hh>
#include <spot/tl/dot.hh>
#include <spot/tl/hierarchy.hh>
#include <spot/tl/parse.hh>
#include <spot/tl/print.hh>
#include <spot/tl/randomltl.hh>
#include <spot/tl/relabel.hh>
#include <spot/tl/simplify.hh>
#include <spot/tl/unabbrev.hh>
#include <spot/twa/twagraph.hh>
#include <spot/twaalgos/complete.hh>
#include <spot/twaalgos/dot.hh>
#include <spot/twaalgos/hoa.hh>
#include <spot/twaalgos/isdet.hh>
#include <spot/twaalgos/neverclaim.hh>
#include <spot/twaalgos/parity.hh>
#include <spot/twaalgos/product.hh>
#include <spot/twaalgos/relabel.hh>
#include <spot/twaalgos/strength.hh>
#include <spot/twaalgos/stutter.hh>
#include <spot/twaalgos/toparity.hh>
#include <spot/twaalgos/translate.hh>
#include <spot/twaalgos/word.hh>

#ifdef __EMSCRIPTEN__
#  include <emscripten/emscripten.h>
#  include <emscripten/version.h>
#else
#  define EMSCRIPTEN_KEEPALIVE
#endif

namespace
{
  // ------------------------------------------------------------------
  // JSON output
  // ------------------------------------------------------------------

  std::string json_str(const std::string& s)
  {
    std::string r = "\"";
    for (unsigned char c: s)
      switch (c)
        {
        case '"': r += "\\\""; break;
        case '\\': r += "\\\\"; break;
        case '\n': r += "\\n"; break;
        case '\r': r += "\\r"; break;
        case '\t': r += "\\t"; break;
        default:
          if (c < 0x20)
            {
              char buf[8];
              snprintf(buf, sizeof buf, "\\u%04x", c);
              r += buf;
            }
          else
            r += c;
        }
    return r + '"';
  }

  // A JSON object whose values are already-encoded JSON text, kept in
  // insertion order.
  class json_obj
  {
    std::vector<std::pair<std::string, std::string>> kv_;

    std::string* find(const std::string& k)
    {
      for (auto& [key, val]: kv_)
        if (key == k)
          return &val;
      return nullptr;
    }

  public:
    void raw(const std::string& k, const std::string& v)
    {
      if (std::string* p = find(k))
        *p = v;
      else
        kv_.emplace_back(k, v);
    }
    void str(const std::string& k, const std::string& v)
    {
      raw(k, json_str(v));
    }
    void boolean(const std::string& k, bool v)
    {
      raw(k, v ? "true" : "false");
    }
    void num(const std::string& k, long v)
    {
      raw(k, std::to_string(v));
    }
    void null(const std::string& k)
    {
      raw(k, "null");
    }
    bool has(const std::string& k)
    {
      return find(k);
    }
    // Append msg to the "note" list, like warn() in spotapi.py.
    void note(const std::string& msg)
    {
      if (std::string* p = find("note"))
        {
          p->pop_back();        // ']'
          *p += ',' + json_str(msg) + ']';
        }
      else
        raw("note", '[' + json_str(msg) + ']');
    }
    std::string text() const
    {
      std::string r = "{";
      bool first = true;
      for (auto& [key, val]: kv_)
        {
          if (!first)
            r += ',';
          first = false;
          r += json_str(key) + ':' + val;
        }
      return r + '}';
    }
  };

  // ------------------------------------------------------------------
  // URL decoding
  // ------------------------------------------------------------------

  int hexval(char c)
  {
    if (c >= '0' && c <= '9')
      return c - '0';
    if (c >= 'a' && c <= 'f')
      return c - 'a' + 10;
    if (c >= 'A' && c <= 'F')
      return c - 'A' + 10;
    return -1;
  }

  // Decode %XX escapes, and also '+' when plus_is_space (query strings).
  std::string url_decode(const std::string& s, bool plus_is_space)
  {
    std::string r;
    for (size_t i = 0; i < s.size(); ++i)
      if (s[i] == '%' && i + 2 < s.size()
          && hexval(s[i + 1]) >= 0 && hexval(s[i + 2]) >= 0)
        {
          r += char(hexval(s[i + 1]) * 16 + hexval(s[i + 2]));
          i += 2;
        }
      else if (plus_is_space && s[i] == '+')
        r += ' ';
      else
        r += s[i];
    return r;
  }

  class query_args
  {
    std::vector<std::pair<std::string, std::string>> args_;
  public:
    explicit query_args(const std::string& q)
    {
      size_t pos = 0;
      while (pos <= q.size())
        {
          size_t amp = q.find('&', pos);
          if (amp == std::string::npos)
            amp = q.size();
          std::string item = q.substr(pos, amp - pos);
          if (!item.empty())
            {
              size_t eq = item.find('=');
              std::string k = item.substr(0, eq);
              std::string v =
                eq == std::string::npos ? "" : item.substr(eq + 1);
              args_.emplace_back(url_decode(k, true), url_decode(v, true));
            }
          pos = amp + 1;
        }
    }

    // request.args.get(k, def)
    std::string get(const std::string& k, const std::string& def) const
    {
      for (auto& [key, val]: args_)
        if (key == k)
          return val;
      return def;
    }

    bool has(const std::string& k) const
    {
      for (auto& [key, val]: args_)
        if (key == k)
          return true;
      return false;
    }

    // request.args.getlist(k)
    std::vector<std::string> getlist(const std::string& k) const
    {
      std::vector<std::string> r;
      for (auto& [key, val]: args_)
        if (key == k)
          r.push_back(val);
      return r;
    }
  };

  template<typename T>
  std::string to_string(const T& x)
  {
    std::ostringstream os;
    os << x;
    return os.str();
  }

  bool contains(const std::vector<std::string>& v, const std::string& s)
  {
    for (auto& e: v)
      if (e == s)
        return true;
    return false;
  }

  // ------------------------------------------------------------------
  // The API, following spotapi.py
  // ------------------------------------------------------------------

  spot::formula parse_ltl(const std::string& input, json_obj& res,
                          const char* errkey = "parse_error",
                          const char* synkey = "prefix_syntax")
  {
    spot::parsed_formula pf = spot::parse_infix_psl(input);
    spot::formula f = pf.f;
    if (!pf.errors.empty())
      {
        // Try the LBT parser in case someone is throwing LBT formulas at us.
        spot::parsed_formula pg = spot::parse_prefix_ltl(input);
        if (!pg.errors.empty())
          {
            std::ostringstream errstr;
            pf.format_errors(errstr);
            res.str(errkey, errstr.str());
          }
        else
          {
            f = pg.f;
            res.boolean(synkey, true);
          }
      }
    return f;
  }

  std::string versions()
  {
    std::string r = "[[\"Spot\"," + json_str(spot::version())
      + ",\"https://spot.lrde.epita.fr/\"]";
#ifdef __EMSCRIPTEN__
    r += ",[\"Emscripten\",\""
      + std::to_string(__EMSCRIPTEN_MAJOR__) + '.'
      + std::to_string(__EMSCRIPTEN_MINOR__) + '.'
      + std::to_string(__EMSCRIPTEN_TINY__)
      + "\",\"https://emscripten.org/\"]";
#endif
    // GraphViz is appended by the JavaScript side, which runs it.
    return r + ']';
  }

  // spotapi.py seeds a new generator with the time in nanoseconds at
  // each call.  The clock is coarser in a browser, so we keep one
  // generator per kind of output instead, seeded once: this also
  // guarantees that successive calls give different formulas.
  spot::randltlgenerator& random_generator(bool psl)
  {
    static std::unique_ptr<spot::randltlgenerator> gen[2];
    std::unique_ptr<spot::randltlgenerator>& g = gen[psl];
    if (!g)
      {
        spot::option_map opts;
        opts.set("output", psl ? spot::randltlgenerator::PSL
                 : spot::randltlgenerator::LTL);
        auto now = std::chrono::system_clock::now().time_since_epoch();
        opts.set("seed", int(std::chrono::duration_cast
                             <std::chrono::nanoseconds>(now).count()
                             % 2147483648LL));
        opts.set("tree_size_min", 5);
        opts.set("tree_size_max", 25);
        opts.set("unique", 1);
        opts.set("wf", 0);
        opts.set("simplification_level", 0);
        g = std::make_unique<spot::randltlgenerator>(3, opts);
      }
    return *g;
  }

  std::string random_formula(const query_args& args)
  {
    spot::randltlgenerator& rg = random_generator(args.has("p"));
    spot::formula f;
    // Try 10 times to avoid true or false
    for (int i = 1; i < 10; ++i)
      {
        f = rg.next();
        if (!(f.is_tt() || f.is_ff()))
          break;
      }
    return json_str(spot::str_psl(f));
  }

  std::string rewrite(const std::string& input, const query_args& args)
  {
    json_obj res;
    spot::formula f = parse_ltl(input, res);
    if (!f)
      return res.text();

    spot::tl_simplifier_options simpopt(false, false, false,
                                        false, false, false,
                                        true, false, false);
    bool simplify = false;
    for (auto& r: args.getlist("r"))
      {
        simplify = true;
        if (r == "br")
          simpopt.reduce_basics = true;
        else if (r == "lf")
          simpopt.reduce_size_strictly = false;
        else if (r == "si")
          simpopt.synt_impl = true;
        else if (r == "eu")
          simpopt.event_univ = true;
        else if (r == "lc")
          {
            simpopt.containment_checks = true;
            simpopt.containment_checks_stronger = true;
          }
        else if (r == "fs")
          simpopt.favor_event_univ = true;
        else if (r == "pn")
          simpopt.nenoform_stop_on_boolean = true;
        else if (r == "bi")
          simpopt.boolean_to_isop = true;
      }
    if (simplify)
      f = spot::tl_simplifier(simpopt).simplify(f);

    std::string unabbrev = args.get("u", "");
    if (!unabbrev.empty())
      f = spot::unabbreviate(f, unabbrev.c_str());

    if (args.get("d", "") == "2")
      f = spot::to_delta2(f);

    std::string syntax = args.get("ff", "o");

    if (syntax == "g")
      {
        std::ostringstream dotsrc;
        spot::print_dot_psl(dotsrc, f);
        json_obj g;
        g.str("svg_dot", dotsrc.str());
        return g.text();
      }

    if (!f.is_ltl_formula() && (syntax == "l" || syntax == "i"))
      {
        res.str("error", "The selected syntax only supports LTL formulas.");
        return res.text();
      }

    std::string s;
    if (syntax == "l")
      s = spot::str_lbt_ltl(f);
    else if (syntax == "i")
      s = spot::str_spin_ltl(f);
    else
      s = spot::str_psl(f);
    res.str("formula", s);
    return res.text();
  }

  const std::map<char, const char*> mp_class_to_english = {
    {'B', "a safety and guarantee property"},
    {'S', "a safety property"},
    {'G', "a guarantee property"},
    {'O', "an obligation property"},
    {'R', "a recurrence property"},
    {'P', "a persistence property"},
    {'T', "a reactivity property"},
  };

  const std::map<std::string, const char*> sfh_class_to_english = {
    {"", "It has too many alternation between strong and weak operators."},
    {"Δ₀", "It has no temporal operator except X."},
    {"Σ₁", "It uses only strong temporal operators (F, U, M, ...) or X."},
    {"Π₁", "It uses only weak temporal operators (G, W, R, ...) or X."},
    {"Δ₁", "Ignoring X operators, each branch of the syntax tree uses "
           "only weak temporal operators (G, W, R, ...) or "
           "strong temporal operators (F, U, M, ...)."},
    {"Σ₂", "Ignoring X operators, in each branch of the syntax tree, "
           "strong temporal operators (F, U, M, ...) appear above "
           "weak operators (G, W, R, ...)."},
    {"Π₂", "Ignoring X operators, in each branch of the syntax tree, "
           "weak temporal operators (G, W, R, ...) appear above strong "
           "operators (F, U, M, ...)."},
    {"Δ₂", "Ignoring X operators, in each branch of the syntax tree, "
           "either weak temporal operators (G, W, R, ...) appear above "
           "strong operators (F, U, M, ...), or strong operators appear "
           "above weak operators."},
  };

  std::string get_sfh_class(spot::formula f2)
  {
    if (f2.is_delta2())
      {
        if (f2.is_delta1())
          {
            if (f2.is_syntactic_safety())
              return f2.is_syntactic_guarantee() ? "Δ₀" : "Π₁";
            if (f2.is_syntactic_guarantee())
              return "Σ₁";
            return "Δ₁";
          }
        if (f2.is_sigma2())
          return "Σ₂";
        if (f2.is_pi2())
          return "Π₂";
        return "Δ₂";
      }
    return "";
  }

  // Port of spot.mp_hierarchy_svg() from Spot's Python bindings.
  std::string mp_hierarchy_svg(char cl)
  {
    const std::map<char, const char*> coords = {
      {'T', "110,35"}, {'R', "40,80"}, {'P', "175,80"}, {'O', "110,140"},
      {'S', "40,160"}, {'G', "175,160"}, {'B', "110,198"},
    };
    std::string highlight;
    if (auto it = coords.find(cl); it != coords.end())
      highlight = std::string("<g transform=\"translate(") + it->second
        + R"svg()">
    <line x1="-10" y1="-10" x2="10" y2="10" stroke="red" stroke-width="5" />
    <line x1="-10" y1="10" x2="10" y2="-10" stroke="red" stroke-width="5" />
    </g>)svg";
    return R"svg(
<svg height="210" width="220" xmlns="http://www.w3.org/2000/svg" version="1.1">
<polygon points="20,0 200,120 200,210 20,210" fill="cyan" opacity=".2" />
<polygon points="20,120 155,210 20,210" fill="cyan" opacity=".2" />
<polygon points="200,0 20,120 20,210 200,210" fill="magenta" opacity=".15" />
<polygon points="200,120 65,210 200,210" fill="magenta" opacity=".15" />
)svg" + highlight + R"svg(
<g text-anchor="middle" font-size="14">
<text x="110" y="20">Reactivity</text>
<text x="60" y="65">Recurrence</text>
<text x="160" y="65">Persistence</text>
<text x="110" y="125">Obligation</text>
<text x="60" y="185">Safety</text>
<text x="160" y="185">Guarantee</text>
</g>
<g font-size="14">
<text text-anchor="begin" transform="rotate(-90,18,210)" x="18" y="210" fill="gray">Monitor</text>
<text text-anchor="end" transform="rotate(-90,18,0)" x="18" y="0" fill="gray">Deterministic Büchi</text>
<text text-anchor="begin" transform="rotate(-90,214,210)" x="214" y="210" fill="gray">Terminal Büchi</text>
<text text-anchor="end" transform="rotate(-90,214,0)" x="214" y="0" fill="gray">Weak Büchi</text>
</g>
</svg>)svg";
  }

  // Like the Python bindings, use one BDD dictionary for all automata,
  // so that they can be combined.
  const spot::bdd_dict_ptr& the_dict()
  {
    static spot::bdd_dict_ptr dict = spot::make_bdd_dict();
    return dict;
  }

  // spot.translate(f, *args) from the Python bindings, for the few
  // option combinations spotapi.py uses.  Like the Python version,
  // this updates f with the simplified formula.
  spot::twa_graph_ptr
  translate(spot::formula& f, int type, int pref,
            spot::postprocessor::optimization_level level)
  {
    spot::translator trans(the_dict());
    trans.set_type(spot::postprocessor::output_type(type));
    trans.set_pref(pref);
    trans.set_level(level);
    return trans.run(&f);
  }

  std::string study(const std::string& input)
  {
    json_obj result;
    spot::formula f = parse_ltl(input, result);
    if (!f)
      return result.text();

    // If the formula uses a lot of atomic propositions together, it's
    // better to relabel it to restrict the size of AP.  We do it
    // always, just in case.
    spot::relabeling_map relabmap;
    spot::formula f2 = spot::relabel_bse(f, spot::Pnn, &relabmap);

    char mp_class = spot::mp_class(f2);
    result.str("mp_class", std::string(1, mp_class));
    result.str("mp_class_text", mp_class_to_english.at(mp_class));

    // -1 = None, 0 = False, 1 = True
    int syntactic_class = -1;
    switch (mp_class)
      {
      case 'R': syntactic_class = f2.is_syntactic_recurrence(); break;
      case 'P': syntactic_class = f2.is_syntactic_persistence(); break;
      case 'O': syntactic_class = f2.is_syntactic_obligation(); break;
      case 'S': syntactic_class = f2.is_syntactic_safety(); break;
      case 'G': syntactic_class = f2.is_syntactic_guarantee(); break;
      case 'B':
        syntactic_class = (f2.is_syntactic_safety()
                           && f2.is_syntactic_guarantee());
        break;
      }
    if (syntactic_class == 0)
      result.boolean("pathological", true);

    result.str("mp_hierarchy_svg", mp_hierarchy_svg(mp_class));

    // syntactic-future hierarchy
    std::string sfh_class = get_sfh_class(f2);
    result.str("sfh_class", sfh_class);
    result.str("sfh_class_text", sfh_class_to_english.at(sfh_class));

    if (syntactic_class == 1
        && ((mp_class == 'O' && sfh_class != "Δ₁")
            || (mp_class == 'R' && sfh_class != "Π₂")
            || (mp_class == 'P' && sfh_class != "Σ₂")))
      result.str("pathological", "sfh");

    // This is to be done before translation, otherwise f will be
    // simplified
    bool ssi = f2.is_syntactic_stutter_invariant();

    using spot::postprocessor;
    spot::twa_graph_ptr pos =
      translate(f2, postprocessor::GeneralizedBuchi, postprocessor::Small,
                postprocessor::Medium);

    // Do this check before relabeling the automaton, to limit the 2^AP
    // explosion in is_liveness_automaton.
    bool safety = mp_class == 'S' || mp_class == 'B';
    if (spot::is_liveness_automaton(pos))
      result.str("safety_liveness", safety ? "both" : "liveness");
    else
      result.str("safety_liveness", safety ? "safety" : "none");

    // f2 was simplified by translate.
    if (!ssi && f2.is_syntactic_stutter_invariant())
      result.str("stutter_invariant_eq",
                 spot::str_psl(spot::relabel_apply(f2, &relabmap)));

    spot::formula nf2 = spot::formula::Not(f2);
    spot::twa_graph_ptr neg =
      translate(nf2, postprocessor::GeneralizedBuchi, postprocessor::Small,
                postprocessor::Medium);

    spot::relabel_here(pos, &relabmap);
    spot::relabel_here(neg, &relabmap);

    if (ssi)
      {
        result.str("stutter_invariant", "no X");
      }
    else
      {
        spot::twa_word_ptr word =
          spot::product(spot::closure(pos),
                        spot::closure(neg))->accepting_word();
        if (!word)
          {
            result.boolean("stutter_invariant", true);
          }
        else
          {
            result.boolean("stutter_invariant", false);
            word->simplify();
            // make sure this words uses all atomic propositions,
            // otherwise word2 might use more propositions and the
            // diagnostic will be confusing.
            word->use_all_aps(pos->ap_vars());
            spot::twa_graph_ptr waut = word->as_automaton();
            if (waut->intersects(pos))
              {
                spot::twa_word_ptr word2 =
                  spot::sl2(waut)->intersecting_word(neg);
                word2->simplify();
                result.str("acc_word", to_string(*word));
                result.str("rej_word", to_string(*word2));
              }
            else
              {
                spot::twa_word_ptr word2 =
                  spot::sl2(waut)->intersecting_word(pos);
                word2->simplify();
                result.str("rej_word", to_string(*word));
                result.str("acc_word", to_string(*word2));
              }
          }
      }

    if (!result.has("acc_word"))
      {
        spot::twa_word_ptr acc_word = pos->accepting_word();
        spot::twa_word_ptr rej_word = neg->accepting_word();
        if (acc_word)
          result.str("acc_word", to_string(*acc_word));
        else
          result.null("acc_word");
        if (rej_word)
          result.str("rej_word", to_string(*rej_word));
        else
          result.null("rej_word");
      }

    // Rabin and Streett indices
    // This is done by calling reduce_parity() on a deterministic
    // parity automaton.
    // Note that f2 is relabeled, so do not attempt to reuse
    // pos as-is after this block.
    if (!spot::is_deterministic(pos))
      pos = translate(f2, postprocessor::Generic,
                      postprocessor::Deterministic, postprocessor::Medium);
    bool ismax, isodd;
    if (!pos->acc().is_parity(ismax, isodd))
      pos = spot::to_parity(pos);
    spot::complete_here(pos);
    spot::change_parity_here(pos, spot::parity_kind_max,
                             spot::parity_style_any);
    pos = spot::reduce_parity(pos);
    bool isparity = pos->acc().is_parity(ismax, isodd);
    if (!isparity || !ismax)
      throw std::runtime_error("reduce_parity() did not return "
                               "a max parity automaton");
    long ns = pos->num_sets() + 1;
    result.num("Rabin_index", (ns + isodd) / 2);
    result.num("Streett_index", (ns + !isodd) / 2);

    return result.text();
  }

  std::string translate(const std::string& input, const query_args& args)
  {
    json_obj res;
    spot::formula f = parse_ltl(input, res);
    if (!f)
      return res.text();

    using spot::postprocessor;
    // The defaults of spot.translate() in Python.
    int type = postprocessor::GeneralizedBuchi;
    int pref = postprocessor::Small;
    int extra = 0;
    postprocessor::optimization_level level = postprocessor::High;
    bool want_complete = false;

    std::string arg_p = args.get("p", "s");
    if (arg_p == "s")
      pref = postprocessor::Small;
    else if (arg_p == "d")
      pref = postprocessor::Deterministic;
    else if (arg_p == "a")
      pref = postprocessor::Any;

    std::string arg_a = args.get("a", "g");
    if (arg_a == "m")
      type = postprocessor::Monitor;
    else if (arg_a == "b")
      // spotapi.py passes 'BA', which spot.translate() maps to Buchi
      // without SBAcc.
      type = postprocessor::Buchi;
    else if (arg_a == "g")
      type = postprocessor::GeneralizedBuchi;
    else if (arg_a == "e")
      type = postprocessor::Generic;
    else if (arg_a == "c")
      type = postprocessor::CoBuchi;
    else if (arg_a == "p")
      {
        type = postprocessor::Parity;
        std::string minmax = args.get("m", "any");
        std::string oddeven = args.get("e", "any");
        if (minmax == "min")
          type |= postprocessor::ParityMin;
        else if (minmax == "max")
          type |= postprocessor::ParityMax;
        else if (minmax != "any")
          throw std::invalid_argument("unknown option 'parity "
                                      + minmax + "'");
        if (oddeven == "odd")
          type |= postprocessor::ParityOdd;
        else if (oddeven == "even")
          type |= postprocessor::ParityEven;
        else if (oddeven != "any")
          throw std::invalid_argument("unknown option 'parity "
                                      + oddeven + "'");
      }

    std::string arg_l = args.get("l", "h");
    if (arg_l == "h")
      level = postprocessor::High;
    else if (arg_l == "m")
      level = postprocessor::Medium;
    else if (arg_l == "l")
      level = postprocessor::Low;

    std::vector<std::string> args_o = args.getlist("o");
    for (auto& arg_o: args_o)
      if (arg_o == "unambiguous")
        extra |= postprocessor::Unambiguous;
      else if (arg_o == "complete")
        {
          extra |= postprocessor::Complete;
          want_complete = true;
        }
      else if (arg_o == "statebased")
        extra |= postprocessor::SBAcc;
      else if (arg_o == "colored" && arg_a == "p")
        extra |= postprocessor::Colored;

    spot::translator trans(the_dict());
    trans.set_type(spot::postprocessor::output_type(type));
    trans.set_pref(pref | extra);
    trans.set_level(level);
    spot::twa_graph_ptr aut = trans.run(&f);

    if (arg_a == "c" && !f.is_syntactic_persistence())
      res.note("Co-Büchi automata can only represent persistence"
               " properties.  If your formula does not belong to this"
               " class, the automaton below will accept a superset of"
               " the intended language.");
    if (arg_a == "m" && !f.is_syntactic_safety())
      res.note("Monitors can only represent safety properties.  "
               "If your formula does not belong to this class, "
               "the automaton below will accept a superset of "
               "the intended language.");
    if (arg_a == "m" && aut->acc().is_buchi() && want_complete)
      res.note("To complete the monitor, "
               "it has been converted to a Büchi automaton.");
    if (arg_a == "p")
      {
        std::string accname = aut->acc().name();
        if (accname.compare(0, 6, "parity") != 0)
          {
            bool ipm, ipo;
            if (aut->acc().is_parity(ipm, ipo))
              {
                unsigned ns = aut->num_sets();
                std::string msg = "Acceptance condition '" + accname
                  + "' is equivalent to 'parity " + (ipm ? "max" : "min")
                  + ' ' + (ipo ? "odd" : "even") + ' '
                  + std::to_string(ns) + '\'';
                if (ns == 1)
                  msg += std::string(" and to 'parity ")
                    + (ipm ? "min" : "max") + ' '
                    + (ipo ? "odd" : "even") + " 1'";
                res.note(msg + '.');
              }
          }
      }

    std::string opt = "arf(Lato)C(#ffffaa)";
    opt += (arg_a == "b" || arg_a == "m" || arg_a == "c") ? 'B' : 'b';
    if (arg_a == "m" && aut->acc().is_t())
      opt += 'A';

    bool highlightnondet = false;
    for (auto& arg_o: args_o)
      {
        if (arg_o == "showscc")
          opt += 's';
        else if (arg_o == "forcetacc")
          opt += 't';
        if (arg_o == "showndet")
          highlightnondet = true;
      }

    if (highlightnondet)
      {
        spot::highlight_nondet_edges(aut, 5);
        spot::highlight_nondet_states(aut, 5);
      }

    if (double(aut->num_edges()) / aut->num_states() > 16)
      {
        res.note("Automaton not displayed because it has too many "
                 "edges per state.");
      }
    else
      {
        if (aut->num_states() > 30)
          res.note("Only the first 30 states of the automaton "
                   "are displayed.");
        // spotapi.py renders the horizontal layout, and if dot had to
        // scale it down, tries the vertical one.  We give both to the
        // JavaScript side, which does the same.
        std::ostringstream h;
        spot::print_dot(h, aut, (opt + "<30").c_str());
        res.str("automaton_dot", h.str());
        std::ostringstream v;
        spot::print_dot(v, aut, (opt + "v<30").c_str());
        res.str("automaton_dot_vertical", v.str());
      }

    aut->set_named_prop("automaton-name",
                        new std::string(spot::str_psl(f)));

    res.num("states", aut->num_states());
    res.num("edges", aut->num_edges());
    res.boolean("det", spot::is_deterministic(aut));

    std::ostringstream hoa;
    spot::print_hoa(hoa, aut, contains(args_o, "forcetacc") ? "t" : "");
    res.str("automaton_hoa", hoa.str());

    if (aut->is_sba().is_true() || aut->acc().is_t())
      {
        std::ostringstream spin;
        spot::print_never_claim(spin, aut);
        res.str("automaton_spin", spin.str());
      }

    return res.text();
  }

  // The Venn diagrams of spotapi.py's compare(), indexed like
  // svg_compare_list.
  const char* const svg_compare_list[][2] = {
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="66" cy="48" rx="60" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="132" cy="48" rx="60" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="51">w₄</text>
       <text text-anchor="middle" x="150" y="51">w₂</text>
       <text text-anchor="middle" x="100" y="51">w₁</text>
       <text text-anchor="middle" x="100" y="96">w₃</text>
    </svg>)svg", "The two formulas are incomparable."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="132" cy="50" rx="50" ry="30" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="132" y="53">w₁</text>
       <text text-anchor="middle" x="20" y="90">w₃</text>
    </svg>)svg", "The first formula covers the second one."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="66" cy="50" rx="50" ry="30" style='fill:cyan;opacity:0.3' />
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="66" y="53">w₁</text>
       <text text-anchor="middle" x="20" y="90">w₃</text>
    </svg>)svg", "The first formula is covered by the second one."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="100" y="53">w₁</text>
       <text text-anchor="middle" x="20" y="90">w₃</text>
    </svg>)svg", "The two formulas are equivalent,"},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="50" cy="50" rx="45" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="150" cy="50" rx="45" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="100" y="90">w₃</text>
    </svg>)svg", "The two formulas are disjoint."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="50" cy="50" rx="45" ry="40" style='fill:cyan;opacity:0.3' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53" style='fill:magenta'>∅</text>
       <text text-anchor="middle" x="120" y="53">w₃</text>
    </svg>)svg", "The second formula is unsatisfiable."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="150" cy="50" rx="45" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="50" y="53" style='fill:#00aaff'>∅</text>
       <text text-anchor="middle" x="80" y="53">w₃</text>
    </svg>)svg", "The first formula is unsatisfiable."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <text text-anchor="middle" x="50" y="53" style='fill:#00aaff'>∅</text>
       <text text-anchor="middle" x="150" y="53" style='fill:magenta'>∅</text>
    </svg>)svg", "Both formulas are unsatisfiable; that makes them equivalent."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="120" height="100" style='fill:cyan;opacity:0.3' />
       <rect x="80" y="0" width="120" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="100" y="53">w₁</text>
    </svg>)svg", "The two formulas are incomparable, but their union accepts all words"},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:cyan;opacity:0.3' />
       <ellipse cx="132" cy="50" rx="50" ry="30" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="132" y="53">w₁</text>
    </svg>)svg", "The first formula is a tautology."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="66" cy="50" rx="50" ry="30" style='fill:cyan;opacity:0.3' />
       <rect x="0" y="0" width="200" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="66" y="53">w₁</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
    </svg>)svg", "The second formula is a tautology."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:cyan;opacity:0.3' />
       <rect x="0" y="0" width="200" height="100" style='fill:magenta;opacity:0.2' />
    </svg>)svg", "Both formulas are tautologies; that makes them equivalent."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="100" height="100" style='fill:cyan;opacity:0.3' />
       <rect x="100" y="0" width="100" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
    </svg>)svg", "The two formulas are complementary."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:cyan;opacity:0.3' />
       <text text-anchor="middle" x="185" y="90" style='fill:magenta'>∅</text>
    </svg>)svg", "The first formula is a tautology, the second one is unsatisfiable; that makes them complementary."},
    {R"svg(<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="185" y="90" style='fill:#00aaff'>∅</text>
    </svg>)svg", "The first formula is unsatisfiable, the second one is a tautology; that makes them complementary."},
  };

  std::string compare(const std::string& input, const query_args& args)
  {
    json_obj result;
    spot::formula f = parse_ltl(input, result);
    spot::formula g = parse_ltl(args.get("g", ""), result,
                                "parse_error2", "prefix_syntax2");
    if (!f || !g)
      return result.text();

    // Get classes before translations, because translate() updates
    // the formulas
    std::string sfh1 = get_sfh_class(f);
    std::string sfh2 = get_sfh_class(g);

    // Like spot.translate() in Python, translate() replaces its
    // argument by the simplified formula, and spotapi.py negates the
    // formulas after that.
    using spot::postprocessor;
    auto tr = [](spot::formula& h)
    {
      return translate(h, postprocessor::GeneralizedBuchi,
                       postprocessor::Small, postprocessor::Low);
    };
    spot::twa_graph_ptr pos_f = tr(f);
    spot::formula nf = spot::formula::Not(f);
    spot::twa_graph_ptr neg_f = tr(nf);
    spot::twa_graph_ptr pos_g = tr(g);
    spot::formula ng = spot::formula::Not(g);
    spot::twa_graph_ptr neg_g = tr(ng);

    spot::twa_word_ptr w1 = pos_f->intersecting_word(pos_g);
    spot::twa_word_ptr w2 = neg_f->intersecting_word(pos_g);
    spot::twa_word_ptr w3 = neg_f->intersecting_word(neg_g);
    spot::twa_word_ptr w4 = pos_f->intersecting_word(neg_g);

    int idx = int(!w2) + int(!w4) * 2 + int(!w1) * 4 + int(!w3) * 8;
    result.str("svg", svg_compare_list[idx][0]);
    result.str("txt", svg_compare_list[idx][1]);
    if (bool(w1) + bool(w2) + bool(w3) + bool(w4) > 1)
      {
        if (w1)
          result.str("w1", to_string(*w1));
        if (w2)
          result.str("w2", to_string(*w2));
        if (w3)
          result.str("w3", to_string(*w3));
        if (w4)
          result.str("w4", to_string(*w4));
      }

    // The two formulas are equivalent exactly when neither has a word
    // the other lacks; deciding this from the prose would break on a
    // copy edit.
    if (sfh1 != sfh2 && !w2 && !w4)
      {
        result.str("sfh1", sfh1);
        result.str("sfh1_text", sfh_class_to_english.at(sfh1));
        result.str("sfh2", sfh2);
        result.str("sfh2_text", sfh_class_to_english.at(sfh2));
      }
    return result.text();
  }

  // Dispatch url to the handler that serves it, and return
  // {"status": N, "body": ...}.
  std::string dispatch(const std::string& url)
  {
    size_t qpos = url.find('?');
    std::string path = url.substr(0, qpos);
    query_args args(qpos == std::string::npos ? "" : url.substr(qpos + 1));

    auto starts = [&](const char* prefix, std::string& rest)
    {
      size_t n = std::char_traits<char>::length(prefix);
      if (path.compare(0, n, prefix) != 0)
        return false;
      rest = url_decode(path.substr(n), false);
      return true;
    };

    std::string body;
    std::string rest;
    if (path == "/api/versions")
      body = versions();
    else if (path == "/api/random")
      body = random_formula(args);
    else if (starts("/api/rewrite/", rest))
      body = rewrite(rest, args);
    else if (starts("/api/study/", rest))
      body = study(rest);
    else if (starts("/api/translate/", rest))
      body = translate(rest, args);
    else if (starts("/api/compare/", rest))
      body = compare(rest, args);
    else
      return "{\"status\":404,\"body\":null}";
    return "{\"status\":200,\"body\":" + body + "}";
  }
}

extern "C"
{
  // Serve url, as spotapi.py would.  The returned string is valid until
  // the next call.
  EMSCRIPTEN_KEEPALIVE
  const char* spotapi(const char* url)
  {
    static std::string answer;
    // We want 600px-wide SVG automata.  Dot renders using 100ppi, so
    // we ask for a 6in-wide picture.  The vertical size is less of an
    // issue, so let's limit it to twice that.
    setenv("SPOT_DOTEXTRA",
           "size=\"6,12\" edge[arrowhead=vee, arrowsize=.7]", 1);
    try
      {
        answer = dispatch(url);
      }
    catch (const std::exception& e)
      {
        // Flask would answer "500 Internal Server Error".
        answer = "{\"status\":500,\"body\":null,\"error\":"
          + json_str(e.what()) + "}";
      }
    return answer.c_str();
  }
}

#ifdef SPOTAPI_MAIN
#include <iostream>

// A native command-line driver, used to test the port without a
// browser: each argument is a URL to serve.
int main(int argc, char** argv)
{
  for (int i = 1; i < argc; ++i)
    std::cout << spotapi(argv[i]) << '\n';
}
#endif
