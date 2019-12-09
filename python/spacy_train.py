import spacy
import random
from spacy.gold import GoldParse
from spacy.util import minibatch, compounding

text = "It surfaced with the trial of Galileo. As you know, Galileo was accused of heresy by the Vatican because his model of the planetary system was not the same as the one the Vatican wanted to " \
       "have true. At that time, Cardinal Bellarmino tried to warn Galileo. Bellarmino, who had been the prosecutor in the case against Giordano Bruno, was a civilized man and, although he was a " \
       "believing Catholic, he felt it was a pity that some of the most intelligent men should have to be burned. He wrote a letter to a friend of Galileo’s saying that Galileo would be prudent if " \
       "he always spoke in the hypothetical mode and presented his theories as theories for making calculations and predictions, but he must not present them as descriptions of God’s world. This " \
       "was the beginning of a split between what I would call rational knowledge and mystical knowledge. The separation of these two CARDINAL kinds of knowledge can be found in much of the " \
       "skeptical thinking of the 16th, 17th, and 18th Centuries. Among others there were thinkers like Gassendi and Mersenne in France, who argued that it was perfectly all right for science to " \
       "make rational models, but they were always models of our experiential world and not models of a real world. The prince of Lichtenstein ist 20 years old."

print("loading model")
nlp = spacy.load("en_core_web_lg")

# print("before training")
# doc = nlp(text)
# for entity in doc.ents:
#     print(entity.text, entity.label_)

print("creating additional training data")
train_data = [
    ("It surfaced with the trial of Galileo.", {"entities": [(29, 37, 'PERSON')]}),
    ("At that time, Cardinal Bellarmino tried to warn Galileo.", {"entities": [(14, 33, 'Person'), (48, 55, 'PERSON')]})
]

print("getting ner pipe")
if "ner" not in nlp.pipe_names:
    ner = nlp.create_pipe("ner")
    nlp.add_pipe(ner, last=True)
# otherwise, get it so we can add labels
else:
    ner = nlp.get_pipe("ner")

print("adding labels")
for _, annotations in train_data:
    for ent in annotations.get("entities"):
        ner.add_label(ent[2])

other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
with nlp.disable_pipes(*other_pipes):
    nlp.begin_training()
    for itn in range(200):
        random.shuffle(train_data)
        losses = {}
        batches = minibatch(train_data, size=compounding(4.0, 32.0, 1.001))
        for batch in batches:
            texts, annotations = zip(*batch)
            nlp.update(
                texts,
                annotations,
                drop=0.5,
                losses=losses
            )
        # print("losses", losses)


print("after training")
text = "It surfaced with the trial of Galileo. As you know, Galileo was accused of heresy by the Vatican because his model of the planetary system was not the same as the one the Vatican wanted to have true. At that time, Cardinal Bellarmino tried to warn Galileo. Bellarmino, who had been the prosecutor in the case against Giordano Bruno, was a civilized man and, although he was a believing Catholic, he felt it was a pity that some of the most intelligent men should have to be burned. He wrote a letter to a friend of Galileo’s saying that Galileo would be prudent if he always spoke in the hypothetical mode and presented his theories as theories for making calculations and predictions, but he must not present them as descriptions of God’s world. This was the beginning of a split between what I would call rational knowledge and mystical knowledge. The separation of these two CARDINAL kinds of knowledge can be found in much of the skeptical thinking of the 16th, 17th, and 18th Centuries. Among others there were thinkers like Gassendi and Mersenne in France, who argued that it was perfectly all right for science to make rational models, but they were always models of our experiential world and not models of a real world."
doc = nlp(text)
for entity in doc.ents:
    print(entity.text, entity.label_)
