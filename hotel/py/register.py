from module import Module
import utility as util

class Register:

  #Constructor
  def __init__(self, module:Module=None, args=None) -> None:

    #Set attributes
    self.__module = module
    self.prefixName   = args['prefixName']
    self.firstName    = args['firstName']
    self.middleName   = args['middleName']
    self.lastName     = args['lastName']
    self.postfixName  = args['postfixName']
    self.gender       = args['gender']
    self.birthday     = args['birthday']
    self.userEmail    = args['userEmail']
    self.loginName    = args['loginName']
    self.password     = args['password']

  #Registration
  def registration(self):
    
    #Connect to dabase
    db = util.Database('estidb', True)

    #Check is not error
    if (not db.isError()):

      #Execute transaction
      db.execute(util.Transaction(
        '''
        INSERT INTO `user`
        ( `type`, `prefix_name`,`first_name`, `middle_name`,`last_name`,   
          `postfix_name`, `gender`, `born`, `email`, `user`, `password`) VALUES 
        ('G', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''',
        [
          self.prefixName,
          self.firstName,
          self.middleName,
          self.lastName,
          self.postfixName,
          self.gender,
          self.birthday,
          self.userEmail,
          self.loginName,
          self.password
        ]
      ))

      #Get result
      result = db.get_result()

    else:
      
      #Get result
      result = db.get_result()

    #Close database
    db.close()

    #Set module result
    self.__module.set_result(result)