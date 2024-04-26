# BigTalkDemo

BigTalkDemo is a Django application that displays real-time video from the user's camera and uses the Hume API to analyze and display facial expressions.

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

