#Import module
from module import Module

#Set arguments
#args = '{"moduleName":"reservation","className":"Reservation","methodName":"booking",#"argsToClass":true,"args":{"roomId":20,"guestId":1,"arrival":"2022-04-26",#"leaving":"2022-04-27","adult":2,"children":2}}'

args = '{"moduleName":"register","className":"Register","methodName":"registration","argsToClass":true,"args":{"prefixName":"Dr.","firstName":"Rozika","middleName":"Piroska","lastName":"Kovács","postfixName":"ifjabb","gender":"F","birthday":"2021-07-22","userEmail":"sasacsacsa","loginName":"sacscasac","password":"saccscsa"}}'

#Create module
module = Module(args)

#Print result
print(module)