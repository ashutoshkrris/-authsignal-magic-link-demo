from flask import Flask, jsonify, redirect, request
from flask_cors import CORS
import authsignal.client
from decouple import config
import jwt

app = Flask(__name__)
CORS(app, supports_credentials=True)

AUTHSIGNAL_BASE_URL = config("AUTHSIGNAL_BASE_URL")
AUTHSIGNAL_SECRET_KEY = config("AUTHSIGNAL_SECRET_KEY")

authsignal_client = authsignal.Client(
    api_key=AUTHSIGNAL_SECRET_KEY,
    api_url=AUTHSIGNAL_BASE_URL
)

@app.route('/api/auth', methods=['POST'])
def auth():
    user_id = request.json.get('userId')
    if not user_id:
        return jsonify({'error': 'Missing userId parameter'}), 400

    response = authsignal_client.track(
        user_id=user_id,
        action="signUp",
        payload={
            "user_id": user_id,
            "redirectUrl": "http://localhost:5000/api/callback"
        }
    )
    return jsonify(response), 200


@app.route("/api/callback", methods=['GET'])
def callback():
    token = request.args.get('token')
    challenge_response = authsignal_client.validate_challenge(token)

    if challenge_response["state"] == 'CHALLENGE_SUCCEEDED':
        response = redirect('http://localhost:3000/')
        response.set_cookie(
            key='auth-session',
            value=token,
            secure=False,
            path='/'
        )
        return response

    return redirect('/')


@app.route("/api/user", methods=['GET'])
def user():
    token = request.cookies.get('auth-session')
    decoded_token = jwt.decode(token, AUTHSIGNAL_SECRET_KEY, algorithms=["HS256"], options={'verify_aud': False})
    user_id = decoded_token.get('sub')
    response = authsignal_client.get_user(user_id=user_id)

    if response["is_enrolled"]:
        return jsonify({"userId": user_id, "email": response["email"]})

    return redirect('/')


if __name__ == '__main__':
    app.run(debug=True)
