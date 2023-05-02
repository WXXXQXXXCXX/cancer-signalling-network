## cancer signalling network
#### Create database:
1. Download neo4j desktop and create a new project
Add dump file to the project directory
2. Create database from the dump file: https://drive.google.com/file/d/1p_UbXs3ZqVqXClFdXVWGKjokGln1bWO_/view?usp=sharing
Open a window and :server user add, create a user name=sig_net, password = sig_net_v6
#### Input data:
1. Target combination input, put under ./be/target_combination: https://drive.google.com/drive/folders/1ULOmuYh5WPDrTrteww8lIYfdR-mOiKdW?usp=sharing
2. Create output directory under ./target_combination. 
3. Input, put under ./be/: https://drive.google.com/drive/folders/1UX1kIuS9qj8d8IJpfhgmg6nSs4tLSBKL?usp=sharing
#### Run
```bash
pip install -r requirements.txt
python main.py

npm install
npm start
```