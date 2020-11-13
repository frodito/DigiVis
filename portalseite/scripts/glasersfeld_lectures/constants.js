const constantTextsGerman = Object.freeze({
    title: 'Glasersfeld Videos',
    description: '<h3>Erkunde die Glasersfeld Lectures</h3>' +
        '<p>Bewege den Mauszeiger über einen Begriff in der ' +
        'Wordcloud um zu sehen in welchen Videos und zu ' +
        'welchen Zeitpunkten darüber gesprochen wird oder ' +
        'über einen Zeitpunkt rechts unten um zu erfahren ' +
        'über welches Thema gesprochen wird.</p>' +
        '<p>Bewege den Mauszeiger über einen Begriff um die ' +
        'entsprechenden Zeitpunkte hervorzuheben und ' +
        'klicke auf den Begriff um die Hervorhebung zu ' +
        'fixieren.</p>' +
        '<p>Klicke auf eine Videotitel um das entsprechende ' +
        'Video von vorne abzuspielen, oder auf einen der ' +
        'Zeitpunkte um die Wiedergabe zu dem entsprechenden ' +
        'Zeitpunkt zu starten.</p>'
});

const constantTextsEnglish = Object.freeze({
    title: 'Glasersfeld Lectures',
    description: '<h3>Explore the Glasersfeld Lectures</h3>' +
        '<p>Move the mouse pointer over a term in the word ' +
        'cloud to see in which videos and at what times it ' +
        'is talked about, or move the mouse pointer over a ' +
        'time in the lower right to find out what topic is ' +
        'being talked about.</p>' +
        '<p>Move the mouse pointer ' +
        'over a term to highlight the corresponding times ' +
        'and click on the term to fix the highlighting.</p>' +
        '<p>Click on a video title to play the corresponding ' +
        'video from the beginning, or click on one of the ' +
        'times to start playback at the corresponding time.</p>'
});

var constantTexts = constantTextsGerman;

var highlight_fixed = false;
