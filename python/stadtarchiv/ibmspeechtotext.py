import json
from ibm_watson import SpeechToTextV1
from scipy.io import wavfile
from os.path import join, dirname

# rate, audiofile = wavfile.read('/home/frod/Downloads/stadtarchiv-interview/short.wav')


speech_to_text = SpeechToTextV1(
    iam_apikey='z3VvBJqeTxfbWIcdAHvEmkzcxbT9Oylx4iFFpJaFg6w5',
    url='https://stream-fra.watsonplatform.net/speech-to-text/api'
)

# speech_models = speech_to_text.list_models().get_result()
# print(json.dumps(speech_models, indent=2))

# speech_model = speech_to_text.get_model('de-DE_BroadbandModel').get_result()
# print(json.dumps(speech_model, indent=2))

with open(join(dirname(__file__), '/home/frod/Downloads/stadtarchiv-interview/',
               'long.wav'), 'rb') as audio_file:
    print("super")
    # speech_recognition_results = speech_to_text.recognize(
    #     audio=audio_file,
    #     content_type='audio/wav',
    #     model='de-DE_BroadbandModel'
    # ).get_result()
# print(json.dumps(speech_recognition_results, indent=2))
