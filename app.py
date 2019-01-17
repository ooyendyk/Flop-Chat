import os
import requests

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
message_history = []

@app.route('/')
def index():
    return render_template('/index.html')

@socketio.on('connect')
def sendMessageHistory():
    emit('message_history', message_history, broadcast=False)

@socketio.on('messageSend')
def handleMessage(msg):
    print('recieved' + msg)
    if (len(message_history) <= 100):
        message_history.append(msg)
    else:
        message_history.pop(0)
        message_history.append(msg)
    emit('message', msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)