#!/usr/bin/python3
# -*- coding: utf-8 -*-
# Copyright (C) 2026 Laboratoire de Recherche et Développement de l'Epita.
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

"""Checks of the answers the panels depend on.

The client tests replace `fetch` with their own responses, so they cannot see
whether the server still speaks the same JSON or still classifies a formula the
same way. These tests call the endpoints through Flask's test client, against
the Spot that is actually installed.
"""

import unittest

import spotapi


class SpotApiTest(unittest.TestCase):
    def setUp(self):
        self.client = spotapi.app.test_client()

    def get(self, path):
        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        return response.get_json()

    def test_versions_lists_each_dependency(self):
        versions = self.get('/api/versions')

        self.assertEqual(len(versions), 4)
        for tool, version, url in versions:
            self.assertIsInstance(tool, str)
            self.assertTrue(version is None or isinstance(version, str))
            self.assertTrue(url is None or isinstance(url, str))
        self.assertIn('Spot', [tool for tool, _, _ in versions])

    def test_random_formulas_differ_between_calls(self):
        # The seed used to be the whole second, which made every call within
        # the same second return the same formula.
        formulas = {self.get('/api/random') for _ in range(5)}

        self.assertGreater(len(formulas), 1)

    def test_random_avoids_the_constants(self):
        for _ in range(10):
            self.assertNotIn(self.get('/api/random'), ('1', '0'))

    def test_random_offers_psl_in_expert_mode(self):
        formula = self.get('/api/random?p=1')

        self.assertIsInstance(formula, str)
        self.assertNotEqual(formula, '')

    def test_rewrite_returns_the_formula(self):
        self.assertEqual(self.get('/api/rewrite/a U b'), {'formula': 'a U b'})

    def test_rewrite_reports_a_syntax_error(self):
        # The partial answer may still be computed; the error must be there.
        self.assertIn('parse_error', self.get('/api/rewrite/a U'))

    def test_rewrite_draws_the_ast(self):
        result = self.get('/api/rewrite/G a?ff=g')

        self.assertIn('<svg', result['svg'])

    def test_rewrite_rejects_psl_in_a_syntax_that_cannot_express_it(self):
        result = self.get('/api/rewrite/%7Ba%5B*%5D%7D%5B%5D-%3Eb?ff=l')

        self.assertIn('error', result)

    def test_rewrite_accepts_psl_in_the_default_syntax(self):
        # An empty ff means Spot syntax; the guard for LBT and Spin must not
        # treat that as one of them.
        result = self.get('/api/rewrite/%7Ba%5B*%5D%7D%5B%5D-%3Eb?ff=')

        self.assertNotIn('error', result)
        self.assertIn('formula', result)

    def test_study_classifies_a_safety_formula(self):
        result = self.get('/api/study/G a')

        self.assertEqual(result['mp_class'], 'S')
        self.assertEqual(result['mp_class_text'], 'a safety property')
        self.assertIn('<svg', result['mp_hierarchy_svg'])

    def test_study_gives_an_accepted_and_a_rejected_word(self):
        result = self.get('/api/study/a U b')

        self.assertEqual(result['mp_class'], 'G')
        self.assertIsInstance(result['acc_word'], str)
        self.assertIsInstance(result['rej_word'], str)

    def test_compare_finds_equivalent_formulas(self):
        result = self.get('/api/compare/a?g=a')

        self.assertIn('equivalent', result['txt'])
        self.assertIn('<svg', result['svg'])
        self.assertIn('w1', result)

    def test_compare_finds_complementary_formulas(self):
        result = self.get('/api/compare/a?g=!a')

        self.assertIn('complementary', result['txt'])

    def test_compare_reports_a_parse_error_in_the_second_formula(self):
        result = self.get('/api/compare/a?g=a U')

        self.assertIn('parse_error2', result)

    def test_translate_counts_the_automaton(self):
        result = self.get('/api/translate/G a')

        self.assertEqual(result['states'], 1)
        self.assertEqual(result['edges'], 1)
        self.assertTrue(result['det'])
        self.assertIn('HOA', result['automaton_hoa'])
        self.assertIn('automaton_spin', result)

    def test_translate_warns_that_a_monitor_is_too_weak(self):
        result = self.get('/api/translate/F a?a=m')

        self.assertTrue(any('safety' in note for note in result['note']))


if __name__ == '__main__':
    unittest.main()
