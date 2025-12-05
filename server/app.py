from flask import Flask, session, redirect, url_for, request, jsonify
import random
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.secret_key = "n8informatique"

pers: dict[str, dict[str, list[str]]] = {
	"stupid": {
		"hello": [
			"You talking to me?",
			"Whatever you say",
			"I didn't hear you",
			"What does that mean?",
			"Wrong room, I think.."
		],
		"bye": [
			"You leaving? Okay, whatever",
			"What does that word mean?",
			"Huh?",
			"Leaving already?"
		],
		"how": [
			"Does it look like I have an idea?",
			"You tell me how",
			"I don't know",
			"I don't think I can"
		],
		"random": [
			"Do you know that I ate a croissant today?",
			"If you add one and one, you get one, because one added to one will form one entity, therefore it's always one"
		]
	},
	
	"sarcastic": {
		"hello": [
			"Oh, you again?",
			"Wow, what an original greeting.",
			"You can go now"
		],
		"bye": [
			"Finally, some peace and quiet.",
			"Don't let the door hit you on the way out.",
			"This is not an airport, no need to announce it."
		],
		"how": [
			"You tell me.",
			"Why do you care?",
			"No idea, try using Google.",
			"That's obvious, maybe try to be a little smarter.",
			"Try this link: https://youtu.be/h9uFQv3t1AU?list=RDh9uFQv3t1AU",
			"I got a solution for you: https://www.reddit.com/r/DecidingToBeBetter/comments/uu53vi/i_dont_feel_very_smart_how_do_i_become_more/"
		],
		"random": [
			"I'm not gonna talk to you.",
			"Why I'm even talking to you?",
			"Imagine being you"
		],
	}
}

special_responses = [
	(1, "Huh? Can you repeat that?"),
	(2, "I didn't hear that right"),
	(3, "Did you say something?"),
	(4, "I'm sorry, but I just forgot what you said")
]

def get_reply(personality: str, user_input: str) -> str:
	user_input = user_input.lower()
	personality_dict = pers.get(personality, {})
	
	synonyms = {
		"hello": ["hi", "hey", "yo"],
		"bye": ["goodbye", "see you", "later"],
		"how": ["how does", "help me", "why", "which"]
	}

	message = ""
	
	for key, replies in personality_dict.items():
		if(re.search(rf"\b{key}\b", user_input)):
			message = random.choice(replies)
			if("" == message):
				return "Bla bla bla"
			else:
				return message
		if(key in synonyms):
			for syn in synonyms[key]:
				if re.search(rf"\b{syn}\b", user_input):
					message = random.choice(replies)
					if("" == message):
						return "Will change this later"
					else:
						return message
	
	if chance(10):
		message = random.choice(personality_dict.get("random", ["...Huh?"]))
		if("" == message):
			return "Bla bla bla"
		else:
			return message
	
	message = "I will pretend that I didn't read whatever you wrote."
	if("" == message):
		return "Bla bla bla"
	else:
		return message

def chance(value: int) -> bool:
	return random.random() < (value / 100)

@app.route("/me")
def me():
	if("username" in session):
		return jsonify({"success_message": f"{session['username']}"}), 200
	else:
		return jsonify({"error": "There is no active session"}), 401 

@app.route("/handle_message", methods=["POST"])
def handle_message():
	print(f"DEBUG: {request.get_json()}")
	res: dict = request.get_json()
	msg: str = res.get("message", "").strip()
	pers: str = res.get("pers", "sarcastic")
	if(not(msg or len(msg) > 200)):
		print("DEBUG: Invalid message")
		return jsonify({"error": "Invalid message"}), 400

	if(msg):
		for prob, text in special_responses:
			if chance(prob):
				return jsonify({"return_message": text}), 200

		return jsonify({"return_message": f"{get_reply(pers, msg)}"}), 200
	else:
		return jsonify({"error": "Error detected"}), 401

if __name__ == "__main__":
	app.run(debug=True)