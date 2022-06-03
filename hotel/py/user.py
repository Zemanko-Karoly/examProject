from module import Module
import utility as util

class User:

  #Constructor
  def __init__(self, module:Module=None, args=None) -> None:

    #Set attributes
    self.__module = module
    self.set_properties(args)

  #Set properties
  def set_properties(self, args):
    self.__properties = args

  #Get property or properties
  def get_properties(self, key=None):

    #Check key exist, and properties has key property
    if (self.__properties and isinstance(key, str) and key in self.__properties):
          return self.__properties[key]
    else: return self.__properties

  #Check result
  def check_result(self, result):
    pass

  #Parse result
  def parse_result(self, result):
    
    #Set result
    result['data'] = result['data']['rows'][0]

    #Set name keys
    keys1 = ['prefix_name','first_name','middle_name','last_name','postfix_name']
    keys2 = ['prefix','first','middle','last','postfix']

    #Set user name
    result['data']['name'] = {}

    #Each keys
    for i, key in enumerate(keys1):
      result['data']['name'][keys2[i]] = result['data'][key]
      del result['data'][key]
    
    #Return result
    return result

  #Get user
  def getUser(self):
    
    #Set error type
    errorType = 0

    #Connect to dabase
    db = util.Database('estidb', True)

    #Check is not error
    if (not db.isError()):

      #Execute transaction
      db.execute(util.Transaction(
        '''
        SELECT  `user`.`id`,
                `user`.`prefix_name`,
                `user`.`first_name`,
                `user`.`middle_name`,
                `user`.`last_name`,
                `user`.`postfix_name`,
                `user`.`password`,
                `user`.`valid`,
                `user`.`attempts`
        FROM `user`
        WHERE BINARY `user`.`user` = BINARY %s;
        ''',
        [self.__properties['user']]
      ))

      #Check is not error
      if (not db.isError()):

        #Get result
        result = db.get_result().copy()
        
        #Check user exist
        if (isinstance(result['data']['rows'], list) and
            len(result['data']['rows']) > 0):

          #Parse result
          result = self.parse_result(result)

          #Check user is valid
          if (result['data']['valid']):

            #Check attempts count is lower then six
            if (result['data']['attempts'] <= 5):

              #Check password
              if (result['data']['password'] == 
                  self.__properties['password']):

                #Remove not neccessery key
                del result['data']['valid']
                del result['data']['attempts']
                del result['data']['password']
                
                #Execute transaction
                db.execute(util.Transaction(
                  '''
                  UPDATE  `user` SET 
                          `user`.`last_logon` = %s, 
                          `user`.`attempts` = %s 
                  WHERE   `user`.`id`= %s;
                  ''',
                  [
                    util.Date.dateTimeToStr(
                      util.Date.getCurrentDateTime()),
                    0,
                    result['data']['id']
                  ]
                ))

              else:

                #Execute transaction
                db.execute(util.Transaction(
                  '''
                  UPDATE  `user` SET 
                          `user`.`last_attempt` = %s, 
                          `user`.`attempts` = %s 
                  WHERE   `user`.`id`= %s;
                  ''',
                  [
                    util.Date.dateTimeToStr(
                      util.Date.getCurrentDateTime()),
                    result['data']['attempts'] + 1,
                    result['data']['id']
                  ]
                ))

                #Set error
                result['data'] = {'error':"User password is not valid!"}

            else:

              #Execute transaction
              db.execute(util.Transaction(
                '''
                UPDATE  `user` SET 
                        `user`.`last_attempt` = %s,
                        `user`.`valid` = %s 
                WHERE   `user`.`id`= %s;
                ''',
                [
                  util.Date.dateTimeToStr(
                    util.Date.getCurrentDateTime()),
                  0,
                  result['data']['id']
                ]
              ))

              #Set error
              result['data'] = {'error':"The number of attempts is greater than allowed!"}

          else:
            
            #Set error
            result['data'] = {'error':"User is not valid!"}

        else:
            
            #Set error
            result['data'] = {'error':"User not exist!"}

      else:

        #Get result
        result = db.get_result().copy()

    else:
      
      #Get result
      result = db.get_result().copy()

    #Close database
    db.close()

    #Set module result
    self.__module.set_result(result)
