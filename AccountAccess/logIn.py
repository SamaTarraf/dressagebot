import os
import bcrypt
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url,key)

def verify_username(username):
    account = supabase.table("accounts").select("*").eq("username", username).execute()

    ##check if username exists
    if(account.data!=[]):
        return True
    return False


def verify_account(username, password):

    account = supabase.table("accounts").select("*").eq("username", username).execute()

    dbPassword = account.data[0]['password']

    if(bcrypt.checkpw(password, dbPassword.encode())):
        print("PASSWORD IS VERIFIED")
        return True
    
    print("PASSWORD IS NOT VERIFIED")
    return False


