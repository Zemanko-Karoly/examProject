# examProject
web development project for my softwere developer exam. Made with a classmate and mentored by a teacher. 

Important:
  For the backend to work, you need to change the path to python in the common.py file
  If you just want to test run with xampp on local machine you need to make sure the apache server can handle python files:
    Open xampp control panel> apache config> Apache(httpd.cond)> add the following two lines to bottom:
                                                                                                      AddHandler cgi-script .py
                                                                                                      ScriptInterpreterSource Registry-Strict
