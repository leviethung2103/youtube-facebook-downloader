# Backend

This backend is built using Flask and provides APIs to fetch YouTube video information and download YouTube videos. It also supports Cross-Origin Resource Sharing (CORS) to allow requests from different origins.

## Setup

1. Clone the repository:
   ```sh
   git clone <repository_url>
   cd <repository_folder>/backend
   ```

2. Create a virtual environment and activate it:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required dependencies:
   ```sh
   pip install -r requirements.txt
   ```

4. Create a `public` directory for storing downloaded files:
   ```sh
   mkdir public
   ```

## Running the Server

To start the Flask server, run:
    ```sh
    gunicorn --bind 0.0.0.0:3001 app:app
    ```