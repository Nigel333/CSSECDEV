# CSSECDEV
# MEMBERS: Nigel Valero, Chantal Sia

STEPS TO RUN THIS DB LOCALLY 

1. Run the SQL file (currently tested using mySQL application only)
2. Have NodeJS installed
3. Run the following line: npm install dotenv express express-handlebars express-session multer express-rate-limit winston express-mysql-session
4. Change the db name, password and other necessary details in the .env file
5. Open and type in terminal to start the website: node app.js
6. Open https://localhost:3000 in your website

NOTE: ADMIN can edit or delete other user's posts (option is available vs when a user is logged in)
      admin account username: admin201
                    password: supersecretpassword123
      RUN DB TWICE AFTER RUNNING node app.js, for some reason admin gets overwritten, will fix in mp2

if https doesnt work, you would need to manually accept the SSL certificate
1. Press Win+R
2. Type certmgr.msc
3. Go to Trusted Root Certification Authorities
4. Go to Certificates, right click, Go to All Tasks, Import
5. Find and select localhost.pem and import
6. Restart your browser