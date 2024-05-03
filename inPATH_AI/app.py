from flask import Flask, request, url_for, redirect, render_template
import pickle
import numpy as np

app = Flask(__name__)

model = pickle.load(open("model.pkl", "rb"))

char_to_num = {
    "A+": 8,
    "A": 7,
    "A-": 6,
    "B+": 5,
    "B": 4,
    "B-": 3,
    "C+": 2,
    "C": 1,
    "R": 0,
}


@app.route("/")
def index():
    return render_template("inpathAI.html")


@app.route("/predict", methods=["POST", "GET"])
def predict():
    char_features = [request.form.get(f"Course{i}") for i in range(1, 14)]
    int_features = [char_to_num[char] for char in char_features]
    final = [np.array(int_features)]
    prediction = model.predict(final)

    # Create a reverse mapping dictionary for department labels
    reverse_category = {
        0: "Civil Engineering Department",
        1: "Mechanical Engineering Department",
        2: "Electrical Engineering Department",
        3: "Computer Engineering Department",
    }

    department_prediction = reverse_category[prediction[0]]

    return render_template(
        "inpathAI.html",
        pred=f"The best fit department for you is {department_prediction}",
    )


if __name__ == "__main__":
    app.run(debug=True,port=3000)
