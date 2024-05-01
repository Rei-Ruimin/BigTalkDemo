# BigTalkDemo

BigTalkDemo is a Django application that displays real-time video from the user's camera and uses [HumeAI](https://www.hume.ai/) and [Deepgram](https://deepgram.com/) to analyze facial expressions, talking speed, and filler word count.

## Installation

Follow these steps to set up the BigTalkDemo project on your local machine.

### Prerequisites

- Python 3.10 or higher
- pip (Python package installer)

### Setup

1. Clone the repository to your local machine, and navigate to the repository folder.

```bash
cd BigTalkDemo
```

2. Create and activate a virtual environment.

   On macOS and Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

   On Windows:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

   **Alternative Way Using pyenv:** If you prefer using pyenv ([installation instructions](https://github.com/pyenv/pyenv#installation)) to manage multiple Python versions, follow these steps:
   - Install Python 3.10 using pyenv (if not already installed):
     ```bash
     pyenv install 3.10.2
     ```
   - Create a virtual environment:
     ```bash
     pyenv virtualenv 3.10.2 venv
     ```
   - Activate the virtual environment:
     ```bash
     pyenv activate venv
     ```

3. Install the required packages.
```bash
pip install -r requirements.txt
```

## Running the Server

Execute the following command in the Django project's root directory to run the development server:

```bash
python manage.py runserver
```

The server will start, and the application will be accessible at `http://127.0.0.1:8000/`.

## Using the Application

1. Open a web browser and navigate to `http://127.0.0.1:8000/`.
2. Click on the 'Start Camera' button to begin video capture and facial expression analysis.
3. The top 3 expressions and expression levels will be displayed in real-time as the data is received from the Hume API.
4. Click on the 'Stop Camera' button to stop the video capture and generates analysis report on transcript, filler words count, and words per minute.

## Deployment on Vercel

BigTalkDemo is also deployed on Vercel and can be accessed via [https://big-talk-demo.vercel.app/](https://big-talk-demo.vercel.app/). 

### Vercel Limitations

Vercel has specific limitations for serverless functions:

| Name                           | Limit      |
| ------------------------------ | ---------- |
| Maximum URL length             | 14 KB      |
| **Maximum request body length** | 4 MB       |
| Maximum number of request headers | 64       |
| Maximum request headers length | 16 KB      |

Serverless functions will return an error `413: FUNCTION_PAYLOAD_TOO_LARGE` if the payload exceeds these limits. This may occur with prolonged recording sessions.

### Mitigation Tips

- Limit recording duration to stay within allowable payload sizes.
- According to tests, the maximum word count limit before hitting payload restrictions is about 18 words.

## Local Setup Recommended for Full Experience

For a complete and unrestricted experience, it is recommended to run the application locally. This avoids the limitations imposed by serverless environments like Vercel, especially regarding payload size restrictions.

Refer to the **Installation** and **Running the Server** sections for local setup instructions.
