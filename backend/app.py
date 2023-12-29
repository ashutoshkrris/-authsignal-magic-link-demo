from flask import Flask, jsonify, redirect, request
from flask_cors import CORS
import authsignal.client
from decouple import config
import jwt

app = Flask(__name__)
CORS(app, supports_credentials=True)

SECRET_KEY = config("SECRET_KEY")
AUTHSIGNAL_BASE_URL = config("AUTHSIGNAL_BASE_URL")
AUTHSIGNAL_SECRET_KEY = config("AUTHSIGNAL_SECRET_KEY")

authsignal_client = authsignal.Client(
    api_key=AUTHSIGNAL_SECRET_KEY,
    api_url=AUTHSIGNAL_BASE_URL
)


@app.route('/api/signup', methods=['POST'])
def signup():
    username = request.json.get('username')
    if not username:
        return jsonify({'error': 'Missing username parameter'}), 400

    response = authsignal_client.track(
        user_id=username,
        action="signUp",
        payload={
            "user_id": username,
            "redirectUrl": "http://localhost:5000/api/callback"
        }
    )
    return jsonify(response), 200


@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    if not username:
        return jsonify({'error': 'Missing username parameter'}), 400

    response = authsignal_client.track(
        user_id=username,
        action="signIn",
        payload={
            "user_id": username,
            "redirectUrl": "http://localhost:5000/api/callback"
        }
    )
    return jsonify(response), 200


@app.route("/api/callback", methods=['GET'])
def callback():
    token = request.args.get('token')
    challenge_response = authsignal_client.validate_challenge(token)

    if challenge_response["state"] == 'CHALLENGE_SUCCEEDED':
        encoded_token = jwt.encode(
            payload={"username": challenge_response["user_id"]},
            key=SECRET_KEY,
            algorithm="HS256"
        )
        response = redirect('http://localhost:3000/')
        response.set_cookie(
            key='auth-session',
            value=encoded_token,
            secure=False,
            path='/'
        )
        return response

    return redirect("/")


@app.route("/api/user", methods=['GET'])
def user():
    token = request.cookies.get('auth-session')
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    username = decoded_token.get('username')
    response = authsignal_client.get_user(user_id=username)
    return jsonify({"username": username, "email": response["email"]}), 200


if __name__ == '__main__':
    app.run(debug=True)
