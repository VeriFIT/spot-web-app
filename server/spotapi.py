#!/usr/bin/python3
# -*- coding: utf-8 -*-
# Copyright (C) 2018-2021, 2024, 2025 Laboratoire de Recherche et
# Développement de l'Epita.
#
# This application is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 3 of the
# License, or (at your option) any later version.
#
# This application is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from flask import Flask, request
from flask import __version__ as flask_version
from flask.json import jsonify
from flask_cors import CORS
from platform import python_version
import subprocess
import re
import os
from time import time

app = Flask(__name__)
CORS(app)

# We want 600px-wide SVG automata.  Dot renders using 100ppi, so we ask for a
# 6in-wide picture.  The vertical size is less of an issue, so let's limit it
# to twice that.
os.environ['SPOT_DOTEXTRA'] = 'size="6,12" edge[arrowhead=vee, arrowsize=.7]'

import spot
from spot.aux import str_to_svg
from functools import wraps

def cachecontrol(max_age=3600):
    def decorate_f(f):
        @wraps(f)
        def wrapped_f(*args, **kwargs):
            response = f(*args, **kwargs)
            if ((type(response) is Flask.response_class) and
                    (response.status_code == 200)):
                response.cache_control.max_age = max_age
            return response
        return wrapped_f
    return decorate_f

def parse_ltl(input, res, errkey='parse_error', synkey='prefix_syntax'):
    env = spot.default_environment.instance()
    pf = spot.parse_infix_psl(input, env)
    f = pf.f
    if pf.errors:
        # Try the LBT parser in case someone is throwing LBT formulas at us.
        pg = spot.parse_prefix_ltl(input, env)
        if pg.errors:
            errstr = spot.ostringstream()
            pf.format_errors(errstr)
            res[errkey] = errstr.str()
        else:
            f = pg.f
            res[synkey] = True
    return f

def warn(res, msg):
    if 'note' in res:
        res['note'].append(msg)
    else:
        res['note'] = [msg]

# Return a Json list of triplets [[tool,version,url],...].
@app.route('/api/versions')
@cachecontrol()
def versions():
    dot = subprocess.Popen(['dot', '-V'],
                           stdout=subprocess.PIPE,
                           stderr=subprocess.PIPE)
    (out, err) = dot.communicate()
    try:
        dot_version = err.split(b"\n")[0].split(b"version ")[1].decode("utf-8")
    except Exception as e:
        dot_version = "missing"

    return jsonify([
        ("Spot", spot.version(), "https://spot.lrde.epita.fr/"),
        ("Python", python_version(), "https://www.python.org/"),
        ("Flask", flask_version, "http://flask.pocoo.org/"),
        ("GraphViz", dot_version, "https://graphviz.gitlab.io/"),
        ])


@app.route('/api/random')
# no cache control for this one!
def random(method='GET'):
    p = request.args.get('p', None)
    gen = spot.randltl(3, tree_size=(5,25),
                       output=('psl' if p else 'ltl'),
                       seed=int(time()))
    # Try 10 time to avoid true or false
    for i in range(1, 10):
        f = next(gen)
        if not (f.is_tt() or f.is_ff()):
            break;
    return jsonify(str(f))

# Rewrite a formula.
#
# URL parameters:
#
# ff=o    Spot syntax
# ff=i    Spin syntax
# ff=l    LBT syntax
# ff=g    graphviz output of the AST
#
# r=br    enable Basic Reductions
# r=lf    allow larger formulas
# r=si    enable Syntactic Implications
# r=eu    enable Eventuality and Universality
# r=lc    enable Language Containment
# r=fs    favor suspendable at top-level
# r=pn    positive normal form
# r=bi    Boolean to ISOP
#
# u=ops   unabbreviate(f, ops)
#
# d=2     to delta2
#
# Output:
#   on success: { formula: "text" } or { svg: "text" }
#   on syntax error: { parse_error: "text" }
@app.route('/api/rewrite/<path:ltlformula>')
@cachecontrol()
def rewrite(ltlformula, method='GET'):

    res = {}

    f = parse_ltl(ltlformula, res)
    if not f:
        return jsonify(res)

    simpopt = spot.tl_simplifier_options(False, False, False,
                                         False, False, False,
                                         True, False, False)

    simplify = False
    for r in request.args.getlist('r'):
        simplify = True
        if r == 'br':
            simpopt.reduce_basics = True
        elif r == 'lf':
            simpopt.reduce_size_strictly = False
        elif r == 'si':
            simpopt.synt_impl = True
        elif r == 'eu':
            simpopt.event_univ = True
        elif r == 'lc':
            simpopt.containment_checks = True
            simpopt.containment_checks_stronger = True
        elif r == 'fs':
            simpopt.favor_event_univ = True
        elif r == 'pn':
            simpopt.nenoform_stop_on_boolean = True
        elif r == 'bi':
            simpopt.boolean_to_isop = True

    if simplify:
        f = spot.tl_simplifier(simpopt).simplify(f)

    unabbrev = request.args.get('u', None)
    if unabbrev:
        f = spot.unabbreviate(f, unabbrev);

    d = request.args.get('d', None)
    if d == '2':
        f = spot.to_delta2(f)

    syntax = request.args.get('ff', 'o')

    if syntax == 'g':
        dotsrc = spot.ostringstream()
        spot.print_dot_psl(dotsrc, f)
        s = dotsrc.str().encode('utf-8')
        return jsonify({'svg': str_to_svg(s)})

    if not f.is_ltl_formula() and syntax in "li":
        res['error'] = "The selected syntax only supports LTL formulas."
        return jsonify(res)

    s = None
    if syntax == 'l':
        s = spot.str_lbt_ltl(f)
    elif syntax == 'i':
        s = spot.str_spin_ltl(f)
    else:
        s = spot.str_psl(f)

    res['formula'] = s
    return jsonify(res)


mp_class_to_english = {
    'B': "a safety and guarantee property",
    'S': "a safety property",
    'G': "a guarantee property",
    'O': "an obligation property",
    'R': "a recurrence property",
    'P': "a persistence property",
    'T': "a reactivity property",
}

sfh_class_to_english = {
    '': "It has too many alternation between strong and weak operators.",
    'Δ₀': "It has no temporal operator except X.",
    'Σ₁': "It uses only strong temporal operators (F, U, M, ...) or X.",
    'Π₁': "It uses only weak temporal operators (G, W, R, ...) or X.",
    'Δ₁': ("Ignoring X operators, each branch of the syntax tree uses "
           "only only weak temporal operators (G, W, R, ...) or "
           "strong temporal operators (F, U, M, ...)."),
    'Σ₂': ("Ignoring X operators, in each branch of the syntax tree, "
           "strong temporal operators (F, U, M, ...) appear above "
           "weak operators (G, W, R, ...)."),
    'Π₂': ("Ignoring X operators, in each branch of the syntax tree, "
           "weak temporal operators (G, W, R, ...) appear above strong "
           "operators (F, U, M, ...)."),
    'Δ₂': ("Ignoring X operators, in each branch of the syntax tree, "
           "either weak temporal operators (G, W, R, ...) appear above"
           "strong operators (F, U, M, ...), or strong operators appear "
           "above weak operatos."),
}


def get_sfh_class(f2):
    if f2.is_delta2():
        if f2.is_delta1():
            if f2.is_syntactic_safety():
                if f2.is_syntactic_guarantee():
                    return 'Δ₀'
                else:
                    return 'Π₁'
            elif f2.is_syntactic_guarantee():
                return 'Σ₁'
            else:
                return 'Δ₁'
        elif f2.is_sigma2():
            return 'Σ₂'
        elif f2.is_pi2():
            return 'Π₂'
        else:
            return 'Δ₂'
    else:
        return ''

# Output
#
# on syntax error: { parse_error: "text" }
#
# on success:
# { mp_class: 'name',
#   mp_class_text: 'description of the class',
#   sfh_class: 'name',
#   sfh_class_text: 'description of the class',
#   pathological: true,   (absent if not pathological)
#   mp_hierarchy_svg: '<svg...'
#   acc_word: 'word',     (an example of accepting word, or null)
#   rej_word: 'word',     (an example of rejecting word, or null)
#   stutter_invariant: false,   (or true, or 'no X')
#   stutter_invariant_eq: formula,  (* see below)
#   safety_liveness: 'safety'  (or 'liveness', or 'both', or 'none')
# }
#
# stutter_invariant_eq is only given if stutter_invariant=true (not 'no X'),
# and simplifying the input ltlformula gives a syntactically stutter-invariant
# formula.
@app.route('/api/study/<path:ltlformula>')
@cachecontrol()
def study(ltlformula, method='GET'):
    result = {}

    f = parse_ltl(ltlformula, result)
    if not f:
        return jsonify(result)

    # If the formula uses a lot of atomic propositions together, it's better to
    # relabel it to restrict the size of AP.  We do it always, just in case.
    relabmap = spot.relabeling_map()
    f2 = spot.relabel_bse(f, spot.Pnn, relabmap)

    mp_class = spot.mp_class(f2)

    result['mp_class'] = mp_class
    result['mp_class_text'] = mp_class_to_english[mp_class]

    syntactic_class = None
    if mp_class == 'R':
        syntactic_class = f2.is_syntactic_recurrence()
    if mp_class == 'P':
        syntactic_class = f2.is_syntactic_persistence()
    if mp_class == 'O':
        syntactic_class = f2.is_syntactic_obligation()
    if mp_class == 'S':
        syntactic_class = f2.is_syntactic_safety()
    if mp_class == 'G':
        syntactic_class = f2.is_syntactic_guarantee()
    if mp_class == 'B':
        syntactic_class = (f2.is_syntactic_safety() and
                           f2.is_syntactic_guarantee())
    if syntactic_class is False:
        result['pathological'] = True

    result['mp_hierarchy_svg'] = spot.mp_hierarchy_svg(mp_class)

    # syntactic-future hierarchy
    sfh_class = get_sfh_class(f2)
    result['sfh_class'] = sfh_class
    result['sfh_class_text'] = sfh_class_to_english[sfh_class]

    if ((syntactic_class is True)
        and ((mp_class == 'O' and sfh_class != 'Δ₁')
             or (mp_class == 'R' and sfh_class != 'Π₂')
             or (mp_class == 'P' and sfh_class != 'Σ₂'))):
        result['pathological'] = 'sfh'

    # This is to be done before translation, otherwise f will be simplified
    ssi = f2.is_syntactic_stutter_invariant()

    pos = spot.translate(f2, 'med')

    # Do this check before relabeling the automaton, to limit the 2^AP
    # explosion in is_liveness_automaton.
    if spot.is_liveness_automaton(pos):
        if mp_class in ('S', 'B'):
            result['safety_liveness'] = 'both'
        else:
            result['safety_liveness'] = 'liveness'
    else:
        if mp_class in ('S', 'B'):
            result['safety_liveness'] = 'safety'
        else:
            result['safety_liveness'] = 'none'

    # f2 was simplified by translate.
    if (ssi is False and f2.is_syntactic_stutter_invariant()):
        result['stutter_invariant_eq'] = str(spot.relabel_apply(f2, relabmap))

    neg = spot.translate(spot.formula_Not(f2), 'med')

    spot.relabel_here(pos, relabmap)
    spot.relabel_here(neg, relabmap)

    if ssi:
        result['stutter_invariant'] = 'no X'
    else:
        word = spot.product(spot.closure(pos),
                            spot.closure(neg)).accepting_word()
        if word is None:
            result['stutter_invariant'] = True
        else:
            result['stutter_invariant'] = False
            word.simplify()
            # make sure this words uses all atomic propositions, otherwise
            # word2 might use more propositions and the diagnostic will be
            # confusing.
            word.use_all_aps(pos.ap_vars())
            waut = word.as_automaton()
            if waut.intersects(pos):
                word2 = spot.sl2(waut).intersecting_word(neg)
                word2.simplify()
                result['acc_word'] = str(word)
                result['rej_word'] = str(word2)
            else:
                word2 = spot.sl2(waut).intersecting_word(pos)
                word2.simplify()
                result['rej_word'] = str(word)
                result['acc_word'] = str(word2)

    if 'acc_word' not in result:
        acc_word = pos.accepting_word()
        rej_word = neg.accepting_word()
        if acc_word is not None:
            result['acc_word'] = str(acc_word);
        else:
            result['acc_word'] = None;
        if rej_word is not None:
            result['rej_word'] = str(rej_word);
        else:
            result['rej_word'] = None;

    # Rabin and Streett indices
    # This is done my calling reduce_parity() on a deterministic
    # parity automaton.
    # Note that f2 is relabeled, so do not attempt to reuse
    # pos as-is after this block.
    if not spot.is_deterministic(pos):
        pos = spot.translate(f2, 'medium', 'generic', 'deterministic')
    isparity, ismax, isodd = pos.acc().is_parity()
    if not isparity:
        pos = spot.to_parity(pos)
    spot.complete_here(pos)
    spot.change_parity_here(pos,
                            spot.parity_kind_max, spot.parity_style_any)
    pos = spot.reduce_parity(pos)
    isparity, ismax, isodd = pos.acc().is_parity()
    assert isparity
    assert ismax
    ns = pos.num_sets() + 1
    result['Rabin_index'] = (ns + int(isodd)) // 2
    result['Streett_index'] = (ns + int(not isodd)) // 2

    return jsonify(result)

# Input parameters
#
#   p=s   small
#   p=d   deterministic
#   p=a   any
#
#   a=m   monitor
#   a=b   BA (state-based)
#   a=g   TGBA
#   a=p   parity
#   a=e   Emerson-Lei
#   a=c   co-Büchi
#
#   if a=p:
#     m=min   parity min
#     m=max   parity max
#     m=any   parity min or max
#     e=odd   parity odd
#     e=even  parity even
#     e=any   parity odd or even
#
#   l=h   high
#   l=m   medium
#   l=l   low
#
#   o=unambiguous
#   o=complete
#   o=statebased
#   o=colored
#   o=showscc
#   o=forcetacc
#   o=showndet
#
# Output
#
# on syntax error: { parse_error: "text" }
# on success:
# { automaton_svg: '<svg...'
#   note: ['text1','text2',...]             (optional)
# }
@app.route('/api/translate/<path:ltlformula>')
@cachecontrol()
def translate(ltlformula, method='GET'):

    res = {}

    f = parse_ltl(ltlformula, res)
    if not f:
        return jsonify(res)

    args = []

    arg_p = request.args.get('p', 's')
    match_arg_p = {
        's': 'small',
        'd': 'deterministic',
        'a': 'any',
    }
    if arg_p in match_arg_p:
        args.append(match_arg_p[arg_p])

    arg_a = request.args.get('a', 'g')
    match_arg_a = {
        'm': 'monitor',
        'b': 'BA',
        'g': 'TGBA',
        'p': 'parity',
        'e': 'generic',
        'c': 'cobuchi',
    }
    if arg_a in match_arg_a:
        if arg_a != 'p':
            args.append(match_arg_a[arg_a])
        else:
            acc = 'parity'
            minmax = request.args.get('m', 'any')
            oddeven = request.args.get('e', 'any')
            if minmax != 'any':
                acc += ' ' + minmax
            if oddeven != 'any':
                acc += ' ' + oddeven
            args.append(acc)

    arg_l = request.args.get('l', 'h')
    match_arg_l = {
        'h': 'high',
        'm': 'med',
        'l': 'low',
    }
    if arg_l in match_arg_l:
        args.append(match_arg_l[arg_l])

    match_arg_trans_opts = {
        'unambiguous': 'unambiguous',
        'complete': 'complete',
        'statebased': 'sbacc',
        'colored': 'colored',
    }
    args_o = request.args.getlist('o')
    for arg_o in args_o:
        if arg_o in match_arg_trans_opts:
            if arg_o != 'colored' or arg_a == 'p':
                args.append(match_arg_trans_opts[arg_o])

    aut = spot.translate(f, *args)

    if arg_a == 'c' and not f.is_syntactic_persistence():
        warn(res, ("Co-Büchi automata can only represent persistence"
                   " properties.  If your formula does not belong to this"
                   " class, the automaton below will accept a superset of"
                   " the intended language."))
    if arg_a == 'm' and not f.is_syntactic_safety():
        warn(res, ("Monitors can only represent safety properties.  "
                   "If your formula does not belong to this class, "
                   "the automaton below will accept a superset of "
                   "the intended language."))
    if arg_a == 'm' and aut.acc().is_buchi() and "complete" in args:
        warn(res, "To complete the monitor, "
             "it has been converted to a Büchi automaton.")
    if arg_a == 'p':
        accname = aut.acc().name()
        if not accname.startswith('parity'):
            [ip,ipm,ipo] = aut.acc().is_parity()
            if ip:
                ns = aut.num_sets()
                msg = \
                  ("Acceptance condition '{}' is equivalent to "
                    "'parity {} {} {}'".format(accname,
                                               "max" if ipm else "min",
                                               "odd" if ipo else "even",
                                               ns))
                if ns == 1:
                    msg += " and to 'parity {} {} 1'".format(
                        "min" if ipm else "max",
                        "odd" if ipo else "even")
                warn(res, msg + '.')

    opt = "arf(Lato)C(#ffffaa)"
    opt += 'B' if arg_a in ('b', 'm', 'c') else 'b'
    if arg_a == 'm' and aut.acc().is_t():
        opt += 'A'

    match_arg_display_opts = {
        'showscc': 's',
        'forcetacc': 't',
    }
    highlightnondet = False
    for arg_o in args_o:
        if arg_o in match_arg_display_opts:
            opt += match_arg_display_opts[arg_o]
        if arg_o == 'showndet':
            highlightnondet = True

    if highlightnondet:
        spot.highlight_nondet_edges(aut, 5)
        spot.highlight_nondet_states(aut, 5)

    dodot = True
    if float(aut.num_edges())/aut.num_states() > 16:
        warn(res, "Automaton not displayed because it has too many edges per state.")
        dodot = False;
    elif aut.num_states() > 30:
        warn(res, "Only the first 30 states of the automaton are displayed.")

    if dodot:
        try:
            dotsrc = spot.ostringstream()
            spot.print_dot(dotsrc, aut, opt + "<30")
            automaton_svg = str_to_svg(dotsrc.str().encode('utf-8'))
            res['automaton_svg'] = automaton_svg
            # Check if the automaton was scaled down.
            m = re.search(r'transform="scale\(([.\d]+) ', automaton_svg)
            if m:
                scale = float(m.group(1))
                if scale <= .9:
                    # Re-render vertically and see if the scale is better
                    dotsrc = spot.ostringstream()
                    spot.print_dot(dotsrc, aut, opt + "v<30")
                    automaton_svg = str_to_svg(dotsrc.str().encode('utf-8'))
                    m = re.search(r'transform="scale\(([.\d]+) ', automaton_svg)
                    if m and scale < float(m.group(1)):
                        res['automaton_svg'] = automaton_svg
        except subprocess.CalledProcessError as e:
            warn(res, "Could not display automaton. " + str(e))

    aut.set_name(str(f))

    res['states'] = aut.num_states()
    res['edges'] = aut.num_edges()
    res['det'] = spot.is_deterministic(aut)

    res['automaton_hoa'] = aut.to_str('hoa',
                                      't' if 'forcetacc' in args_o else '')

    if aut.is_sba() or aut.acc().is_t():
        res['automaton_spin'] = aut.to_str('spin')


    return jsonify(res)



svg_compare_list = [
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="66" cy="48" rx="60" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="132" cy="48" rx="60" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="51">w₄</text>
       <text text-anchor="middle" x="150" y="51">w₂</text>
       <text text-anchor="middle" x="100" y="51">w₁</text>
       <text text-anchor="middle" x="100" y="96">w₃</text>
    </svg>""", "The two formulas are incomparable."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="132" cy="50" rx="50" ry="30" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="132" y="53">w₁</text>
       <text text-anchor="middle" x="20" y="90">w₃</text>
    </svg>""", "The first formula covers the second one."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="66" cy="50" rx="50" ry="30" style='fill:cyan;opacity:0.3' />
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="66" y="53">w₁</text>
       <text text-anchor="middle" x="20" y="90">w₃</text>
    </svg>""", "The first formula is covered by the second one."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="100" cy="50" rx="90" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="100" y="53">w₁</text>
       <text text-anchor="middle" x="20" y="90">w₃</text>
    </svg>""", "The two formulas are equivalent,"),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="50" cy="50" rx="45" ry="40" style='fill:cyan;opacity:0.3' />
       <ellipse cx="150" cy="50" rx="45" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="100" y="90">w₃</text>
    </svg>""", "The two formulas are disjoint."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="50" cy="50" rx="45" ry="40" style='fill:cyan;opacity:0.3' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53" style='fill:magenta'>∅</text>
       <text text-anchor="middle" x="120" y="53">w₃</text>
    </svg>""", "The second formula is unsatisfiable."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="150" cy="50" rx="45" ry="40" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="50" y="53" style='fill:#00aaff'>∅</text>
       <text text-anchor="middle" x="80" y="53">w₃</text>
    </svg>""", "The first formula is unsatisfiable."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <text text-anchor="middle" x="50" y="53" style='fill:#00aaff'>∅</text>
       <text text-anchor="middle" x="150" y="53" style='fill:magenta'>∅</text>
    </svg>""", "Both formulas are unsatisfiable; that makes them equivalent."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="120" height="100" style='fill:cyan;opacity:0.3' />
       <rect x="80" y="0" width="120" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
       <text text-anchor="middle" x="100" y="53">w₁</text>
    </svg>""", "The two formulas are incomparable, but their union accepts all words"),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:cyan;opacity:0.3' />
       <ellipse cx="132" cy="50" rx="50" ry="30" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="132" y="53">w₁</text>
    </svg>""", "The first formula is a tautology."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <ellipse cx="66" cy="50" rx="50" ry="30" style='fill:cyan;opacity:0.3' />
       <rect x="0" y="0" width="200" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="66" y="53">w₁</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
    </svg>""", "The second formula is a tautology."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:cyan;opacity:0.3' />
       <rect x="0" y="0" width="200" height="100" style='fill:magenta;opacity:0.2' />
    </svg>""", "Both formulas are tautologies; that makes them equivalent."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="100" height="100" style='fill:cyan;opacity:0.3' />
       <rect x="100" y="0" width="100" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="50" y="53">w₄</text>
       <text text-anchor="middle" x="150" y="53">w₂</text>
    </svg>""", "The two formulas are complementary."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:cyan;opacity:0.3' />
       <text text-anchor="middle" x="185" y="90" style='fill:magenta'>∅</text>
    </svg>""", "The first formula is a tautology, the second one is unsatisfiable; that makes them complementary."),
    ("""<svg width="200px" height="100px" viewBox="0 0 200 100">
       <rect x="0" y="0" width="200" height="100" style='fill:magenta;opacity:0.2' />
       <text text-anchor="middle" x="185" y="90" style='fill:#00aaff'>∅</text>
    </svg>""", "The first formula is unsatisfiable, the second one is a a tautology; that makes them complementary.")
    ]

def svg_compare(w1, w2, w3, w4):
    idx = int(w2 is None) + int(w4 is None)*2 + int(w1 is None)*4 + int(w3 is None)*8
    return svg_compare_list[idx]

@app.route('/api/compare/<path:ltlformula>')
@cachecontrol()
def compare(ltlformula, method='GET'):
    result = {}

    f = parse_ltl(ltlformula, result)

    g = parse_ltl(request.args.get('g', ""),
                  result, errkey='parse_error2', synkey='prefix_syntax2')

    if not f or not g:
        return jsonify(result)

    # Get classes before translations, because spot.translate() update the formulas
    sfh1 = get_sfh_class(f)
    sfh2 = get_sfh_class(g)

    pos_f = spot.translate(f, 'low')
    neg_f = spot.translate(spot.formula_Not(f), 'low')
    pos_g = spot.translate(g, 'low')
    neg_g = spot.translate(spot.formula_Not(g), 'low')

    w1 = pos_f.intersecting_word(pos_g)
    w2 = neg_f.intersecting_word(pos_g)

    w3 = neg_f.intersecting_word(neg_g)
    w4 = pos_f.intersecting_word(neg_g)

    svg, txt = svg_compare(w1, w2, w3, w4)
    result['svg'] = svg
    result['txt'] = txt
    twowordsormore = sum((w is not None for w in (w1, w2, w3, w4))) > 1
    if twowordsormore:
        if w1:
            result['w1'] = str(w1)
        if w2:
            result['w2'] = str(w2)
        if w3:
            result['w3'] = str(w3)
        if w4:
            result['w4'] = str(w4)

    if (sfh1 != sfh2) and ("equivalent" in txt):
        result['sfh1'] = sfh1
        result['sfh1_text'] = sfh_class_to_english[sfh1]
        result['sfh2'] = sfh2
        result['sfh2_text'] = sfh_class_to_english[sfh2]

    return jsonify(result)


@app.route('/api/drawword/<path:word>')
@cachecontrol()
def drawword(word, method='GET'):
    result = {}
    try:
        w = spot.parse_word(word)
    except SyntaxError as e:
        return jsonify({'parse_error': str(e)})
    return jsonify({'svg': w.as_svg()})


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True, use_debugger=False)
