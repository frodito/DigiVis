from pycorenlp import StanfordCoreNLP

# text = "Angefangen hat es eigentlich, ich war ihn Wien. Meine Kusine hat in Wien gewohnt, in der Lerchenfelderstraße und da war ich auf Besuch und da waren in Wien, in der Burggasse waren die Sionschwestern. Und die Sionschwestern und da war unter anderem eine gewisse Schwester Hedwig Wahle. Und die Schwester Hedwig Wahle war Jüdin gewesen, ist aber katholisch geworden und ist dann eben in diesen Orden eingetreten, nicht. Jetzt ist es ja, glaube ich, mehr so ein Weltorden. Sie hat eigentlich keine, sie hat schon irgendwie so ein Kleid, aber sie hat, sie ist meistens immer so in Zivil gegangen. Und da bin ich einmal zufällig gewesen mit meiner Kusine, da ist eben auch so ein Zentrum mit jüdisch-christlichem Dialog, nicht. Da habe ich von uns noch gar nichts gewusst und da, da war zufällig auch ein ganz berühmter Mann, das war der Professor Österreicher. Haben Sie von dem einmal was gehört?"
# text = "The understanding, like the eye, whilst it makes us see and perceive all other things, " \
#        "takes no notice of itself; and it requires art and pains to set it at a distance and make it its own object. (John Locke, 1690)"
file = open("texts/Abstraction, Re-Presentation, and Reflection: An Interpretation of Experience and of Piaget’s Approach.txt", "r")
text = file.read().replace('/n', ' ')

nlp = StanfordCoreNLP("http://localhost:9876")
res = nlp.annotate(text, properties={
    'annotators': 'ner',
    'outputFormat': 'json',
    'timeout': 5000000,
})

# print(res)

for sentence in res['sentences']:
    for token in sentence['tokens']:
        print(token['originalText'], token['pos'], token['ner'])