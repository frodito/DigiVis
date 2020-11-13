var letterAndFrame;
const quotations = Object.freeze({
    glass:
        'Let us assume that I was here yesterday and, just as now,' +
        'had a glass of water in front of me. I come in today and say: “Oh, this is the' +
        'same glass, the identical glass that stood here yesterday.” If someone asked me,' +
        'how I can tell that it is the identical glass, I should have to look for a' +
        'particular that distinguishes this glass from all others. This may turn out' +
        'to be impossible. But this is not the problem I want to focus on.',
    flowers:
        'To say that the flowers on my desk “have faded”, I must believe that the' +
        'dry, drooping things I now see are the identical individuals that I saw' +
        'bright and dewy a few days ago. If I suspected a substitution, I could' +
        'not rightly think of fading, nor would I have grounds to look for some' +
        'agent that might have caused the change that did not take place. In fact,' +
        'the construction of the concept of change requires a judgement of' +
        '“different” with regard to the two experiential items that are considered' +
        'to be one and the same in the sense of individual identity.',
    letter: (letterAndFrame =
        'A person whose identity is questioned because the years of absence' +
        'have made him unrecognizable to his family, will, as a last resort,' +
        'recount memories of events experienced in their company. More often' +
        'than not, this will do the trick, because the possession of specific' +
        'memories is accepted as unquestionable proof of individual continuity.' +
        '(It does not matter how he looks or sounds today – if he remembers' +
        'how we climbed the wall and stole the strawberries from the garden' +
        'next door, he must be my brother!) It may come as a shock to realize' +
        'that this “proof” is valid only because we do not believe in telepathy.' +
        'If we considered possible the transmission of thoughts, memory could' +
        'no longer serve as evidence of identity.'),
    frame: letterAndFrame,
    clock:
        '1710, Caramuel knew that “number is a thing of the mind”. He demonstrated' +
        'the point by means of a delightful story: </br>' +
        '    There was a man who talked in his sleep. When the clock struck the' +
        'fourth hour, he said: ‘One, one, one, one – this clock must be mad –' +
        'it has struck one four times.’ The man clearly had counted four times' +
        'one stroke, not the striking of four. He had in mind, not a four, but a' +
        'one taken four times; which goes to show that counting and considering' +
        'several things contemporaneously are different activities. </br>' +
        '    If I had four clocks in my library, and all four were to strike one at' +
        'the same time, I should not say that they struck four, but that they' +
        'struck one four times. This difference is not inherent in the things,' +
        'independent of the operations of the mind. On the contrary, it depends' +
        'on the mind of him who counts. The intellect, therefore, does not find' +
        'numbers but makes them; it considers dif-ferent things, each distinct' +
        'in itself, and intentionally unites them in thought. ',
    pen:
        'The pen I hold in my hand does not become another while you’re watching' +
        'it. You are quite sure of that – at least until you’ve seen a sharper' +
        'do a sleight of hand with cards. Then you suddenly realize that things' +
        'can change their identity under your very eyes. It is a question of' +
        'speed – and speed, after all, is the quotient of space and time. The' +
        'conservation of individual identity may be more of a problem than it' +
        'seemed.',
})


const constantTextsGerman = Object.freeze({
    title: 'Identit&auml;tenschreibtisch',
    replay: 'Video erneut abspielen',
    discoverImage: 'Erkunde das Bild',
});

const constantTextsEnglish = Object.freeze({
    title: 'Identity Desktop',
    replay: 'Replay video',
    discoverImage: 'Discover the image',
});

var constantTexts = constantTextsGerman;

const hoverableImagePath = "media/explainer_videos/small/";
