from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    # Serve from static folder
    return app.send_static_file('index.html')


@app.route('/api/data', methods=['GET', 'POST'])
def get_data():
    if request.method == 'POST':
        input1 = request.json.get('input1')
        input2 = request.json.get('input2')
        return jsonify({
            "row1": {"name": f"Main row with input1: {input1}"},
            "row2": [{"item": f"Nested item 1 with input2: {input2}"},
                     {"item": "Nested item 2"}]
        })
    return jsonify({"error": "Method not allowed"}), 405


@app.route('/api/error')
def error():
    return jsonify({"error": "An error occurred"}), 500


if __name__ == '__main__':
    app.run(debug=True)
