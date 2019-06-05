from unittest import TestCase

from try_spacy import DigiVisNER

class TestTrySpacy(TestCase):
    
    def setUp(self) -> None:
        self.ner = DigiVisNER()
    
    def test_annotate_text(self):
        self.assertEqual(self.ner.text_annotated, '{{PER|text=Alan Mathison Turing}} was an {{'
                                                  'MISC|text=English}} mathematician, computer scientist, logician, cryptanalyst, philosopher and theoretical biologist. {{PER|text=Turing}} was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the {{PER|text=Turing}} machine, which can be considered a model of a general-purpose computer. {{PER|text=Turing}} is widely considered to be the father of theoretical computer science and artificial intelligence. Despite these accomplishments, he was never fully recognised in his home country during his lifetime, due to his homosexuality, which was then a crime in the {{LOC|text=UK}}.')
