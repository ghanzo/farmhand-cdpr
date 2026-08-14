import turtle
import math
from time import time

#defining the time variable
time_start = int(time()*100)
time_elapsed = 0

#defining the motor and the shuttle
shuttle = turtle.Turtle()
top_right_motor = turtle.Turtle()

#Setting the boundaries of the demo

def setup():
  bounds_of_demonstration = turtle.Turtle()
  bounds_of_demonstration.ht()
  top_right_motor.ht()
  bounds_of_demonstration.speed(10)
  bounds_of_demonstration.up()
  bounds_of_demonstration.goto(-100,100)
  bounds_of_demonstration.color('blue')
  bounds_of_demonstration.down()
  bounds_of_demonstration.goto(100,100)
  bounds_of_demonstration.goto(100,-100)
  bounds_of_demonstration.goto(-100,-100)
  bounds_of_demonstration.goto(-100,100)
  bounds_of_demonstration.goto(0,100)
  bounds_of_demonstration.goto(0,-100)
  bounds_of_demonstration.goto(100,-100)
  bounds_of_demonstration.goto(100,0)
  bounds_of_demonstration.goto(-100,0)
  bounds_of_demonstration.up()
  top_right_motor.up()
  top_right_motor.speed(10)
  top_right_motor.goto(100,100)
  top_right_motor.color('orange')
  shuttle.speed(10)
  shuttle.color('red')
  shuttle.goto(0,0)
setup()

#the motor steps at this distance each step
step_distance = 1

#this is the total time and distance for the translation
total_time = 10000
total_steps_for_translation = 0
total_distance_for_translation = 100

#desired shuttle path that transits at a set rate
shuttle_step_progress = 0
shuttle_step_rate = 10
shuttle_next_step = 10
shuttle_step_setter = 0

#converts radians to degrees 
conversion = 57.295
#variables
motor_cable_length = 0
motor_op_length = 100
motor_xcor = 0
motor_cable_angle = 0

motor_next_step_cable_length = 0
motor_next_step_angle = 0
motor_next_step_op_length = 0
motor_next_step_xcor = 0

shuttle_xcor = 0
shuttle_xdistance_to_tower = 100

#various functions, poorly written, not really sure how to use the larger scope of the variables already set
def length_by_hyp_angle(hypotenuse, angle, conversion):
  return hypotenuse*math.sin(angle/conversion)
def length_by_hyp_height(hyp):
  return math.sqrt(hyp**2-100**2)
def angle_by_height_hyp(height,hypotenuse,conversion):
  return math.acos(height/hypotenuse)*conversion
def length_by_angle_height(angle, conversion):
  return 100*math.tan(angle/conversion)
def hypotenuse_by_length(shuttle_x_position):
  return math.sqrt(shuttle_x_position**2+100**2)

#these are setting the variables values
motor_cable_length = hypotenuse_by_length(100)
motor_cable_angle = angle_by_height_hyp(100,motor_cable_length,conversion)
motor_op_length = length_by_hyp_angle(motor_cable_length,motor_cable_angle,conversion)
motor_xcor = motor_op_length - 100

motor_cable_length = hypotenuse_by_length(100)
motor_cable_angle = angle_by_height_hyp(100,motor_cable_length,conversion)
motor_op_length = length_by_hyp_angle(motor_cable_length,motor_cable_angle,conversion)
motor_xcor = motor_op_length - 100

motor_next_step_cable_length = motor_cable_length -1
motor_next_step_angle = angle_by_height_hyp(100,motor_next_step_cable_length,conversion)
motor_next_step_op_length = length_by_hyp_angle(motor_next_step_cable_length,motor_next_step_angle,conversion)
motor_next_step_xcor = 100 - motor_next_step_op_length

#for testing the values
print (motor_cable_length)
print (motor_cable_angle)
print (motor_op_length)
print (motor_xcor)
print (motor_next_step_cable_length)
print (motor_next_step_angle)
print (motor_next_step_op_length)
print (motor_next_step_xcor)


for x in range(10000000):
  #updates the time, reduces time
  centiseconds = int(time()*100)
  time_elapsed = centiseconds - time_start          
  
  #time between the steps of shuttle   
  shuttle_step_progress = time_elapsed - shuttle_step_setter
  
  if (shuttle.xcor() > 85):
      break

  #resets the step clock for shuttle and moves shuttle forward 
  if time_elapsed > shuttle_next_step:    
    shuttle_next_step += shuttle_step_rate
    shuttle_step_setter += shuttle_step_rate
    shuttle.forward(1)
    shuttle_xdistance_to_tower -= 1

  #this looks at the closeness of the prior step and the next step to the current shuttle position and steps when the next step is closer and then resets the values
  if (( shuttle_xdistance_to_tower - motor_next_step_op_length ) < (motor_op_length - shuttle_xdistance_to_tower)):
    top_right_motor.down()
    top_right_motor.goto(motor_next_step_xcor,0)
    top_right_motor.up()
    top_right_motor.goto(100,100)
    motor_cable_length = motor_next_step_cable_length
    motor_cable_angle = motor_next_step_angle
    motor_xcor = motor_next_step_xcor
    motor_op_length = motor_next_step_op_length
    motor_next_step_cable_length -= 1
    motor_next_step_angle = angle_by_height_hyp(100,motor_next_step_cable_length,conversion)
    motor_next_step_op_length = length_by_hyp_angle(motor_next_step_cable_length,motor_next_step_angle,conversion)
    motor_next_step_xcor = 100 - motor_next_step_op_length

  print(time_elapsed)
  
print("translation finished")