# BigTalkDemo

BigTalkDemo is a Django application that displays real-time video from the user's camera and uses [HumeAI](https://www.hume.ai/) and [Deepgram](https://deepgram.com/) to analyze facial expressions, talking speed and filler words count.

## Installation

Follow these steps to set up the BigTalkDemo project on your local machine.

### Prerequisites

- Python 3.10 or higher
- pip (Python package installer)

### Setup

1. Clone the repository to your local machine, and open the repository folder.

2. Navigate to the project's root directory (the second BigTalkDemo folder).

```sh
cd BigTalkDemo
```

3. Create a virtual environment.
```sh
python3 -m venv venv
```

4. Activate the virtual environment.

    On macOS and Linux:
    ```sh
    source venv/bin/activate
    ```

    On Windows:
    ```sh
    .\venv\Scripts\activate
    ```
**Alternative Way Using pyenv:** If you prefer to manage multiple Python versions, you can use pyenv to install and manage your Python environment. You can find the installation instructions [here](https://github.com/pyenv/pyenv#installation)
a. Install Python 3.10 using pyenv (if not already installed):
```sh
pyenv install 3.10.2
```
b. Create a virtual environment
```sh
pyenv virtualenv 3.10.2 venv
```
c. Activate
```sh
pyenv activate venv
```

5. Install the required packages.
```sh
pip install -r requirements.txt
```

## Running the Server

To run the Django development server, execute the following command in django project's root directory (the second BigTalkDemo foler)
```sh
python manage.py runserver
```

The server should start, and the application will be accessible at `http://127.0.0.1:8000/`.

## Using the Application

1. Open a web browser and navigate to `http://127.0.0.1:8000/`.
2. Click on the 'Start Camera' button to begin video capture and facial expression analysis.
3. The top 3 expressions and expression levels will be displayed in real-time as the data is received from the Hume API.
4. Click on the 'Stop Camera' button to stop the video capture and clear the displayed data.

## Deployment on Vercel

BigTalkDemo is also deployed on Vercel and can be accessed via [https://big-talk-demo.vercel.app/](https://big-talk-demo.vercel.app/). 

### Vercel Limitations

The maximum payload size for the request body or the response body of a Serverless Function is 4 MB. Here are other relevant limits when working with Vercel's serverless functions:

| Name                           | Limit      |
| ------------------------------ | ---------- |
| Maximum URL length             | 14 KB      |
| **Maximum request body length** | 4 MB       |
| Maximum number of request headers | 64       |
| Maximum request headers length | 16 KB      |

If a Serverless Function receives a payload exceeding this limit, it will return an error `413: FUNCTION_PAYLOAD_TOO_LARGE`. This could occur if the audio data from a prolonged recording session is too large.

### Issues with Limitations

When using the application, if the audio data is too large (i.e., the recording is too long), it may trigger a `FUNCTION_PAYLOAD_TOO_LARGE` error. To avoid this:

- **Limit the duration of recordings to ensure the size remains within the allowable range.**
- **According to the test, the maximum limit is around 18 words. Try not to say more than this word limit during usage.**

## Local Setup Recommended for Full Experience

While the BigTalkDemo is accessible online via Vercel, for a complete and unrestricted experience, it is recommended to run the application locally. This approach avoids the limitations imposed by serverless environments like Vercel, particularly concerning payload size restrictions.

To set up and run the application locally, follow the installation and server running instructions outlined above under **Installation** and **Running the Server** sections.
