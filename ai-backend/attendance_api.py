from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

@app.route("/face-login", methods=["GET"])
def face_login():
    print("\n🎬 React Button Clicked! Preparing to initialize video capture window...")
    
    try:
        script_path = "login.py"
        if not os.path.exists(script_path):
            print(f"❌ Error: Can't find '{script_path}' file in this directory.")
            return jsonify({"name": "Unknown", "error": "login.py missing"})

        print("🚀 Executing tracking workflow using system interpreter: py")
        
        # 🟢 Using the global 'py' command to run login.py smoothly
        result = subprocess.check_output(
            ["py", script_path],
            text=True,
            stderr=subprocess.STDOUT  
        )
        
        detected_name = result.strip().split('\n')[-1] 
        print(f"🎯 Identity pipeline successfully parsed: {detected_name}")

        return jsonify({"name": detected_name})
        
    except subprocess.CalledProcessError as e:
        print("❌ Subprocess execution crashed inside login.py lifecycle:")
        print(e.output)
        return jsonify({"name": "Unknown", "error": "Internal window crash"})
    except Exception as e:
        print("❌ Pipeline Handshake Failure:", str(e))
        return jsonify({"name": "Unknown", "error": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)