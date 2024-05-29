import os
# Set DISPLAY environment variable
os.environ['DISPLAY'] = ':1'
import pyautogui
import random
import time
orig_x, orig_y = pyautogui.position()
def debug(msg):
    print(msg, flush=True)
    
pyautogui.FAILSAFE = False #PyAutoGUI fail-safe triggered from mouse moving to a corner of the screen

def human_like_mouse_movement(duration, max_step=300, sleep_min=0, sleep_max=1):
    """
    Move the mouse in a human-like manner for a specified duration.

    :param duration: How long to move the mouse, in seconds.
    :param max_step: Maximum distance the mouse can move in one step, in pixels.
    :param sleep_min: Minimum time to pause between movements, in seconds.
    :param sleep_max: Maximum time to pause between movements, in seconds.
    """
    end_time = time.time() + duration
    while time.time() < end_time:
        # Get the current mouse position
        x, y = pyautogui.position()

        # Calculate new position with random step
        new_x = x + random.randint(-max_step, max_step)
        new_y = y + random.randint(-max_step, max_step)

        # Ensure new position is within the screen bounds
        new_x = max(0, min(pyautogui.size().width, new_x))
        new_y = max(0, min(pyautogui.size().height, new_y))

        # Move the mouse to the new position
        pyautogui.moveTo(new_x, new_y, duration=random.uniform(0.1, 0.3))
        # Pause for a random time to mimic a human
        time.sleep(random.uniform(sleep_min, sleep_max))
        
        
def check_for_message(message_image):
    """
    Check if the message is currently displayed on the screen.

    :param message_image: The file path to the image of the message to look for.
    :return: True if the message is on screen, False otherwise.
    """
    try:
        return pyautogui.locateOnScreen(message_image, confidence=0.8) is not None
    except pyautogui.ImageNotFoundException:
        return False
        
def check_for_captcha_complete(complete_image):
    """
    Check if the the captcha is complete.

    :param complete_image: The file path to the image of the message to look for.
    :return: True if the message is on screen, False otherwise.
    """
    try:
        return pyautogui.locateOnScreen(complete_image, confidence=0.8) is not None
    except pyautogui.ImageNotFoundException:
        return False
        
def human_like_mouse_movement_to_target(target_x, target_y, max_step=100, sleep_min=0.01, sleep_max=.2):
    """
    Move the mouse in a human-like manner towards a target location.

    :param target_x: The x-coordinate of the target location.
    :param target_y: The y-coordinate of the target location.
    :param max_step: Maximum distance the mouse can move in one step, in pixels.
    :param sleep_min: Minimum time to pause between movements, in seconds.
    :param sleep_max: Maximum time to pause between movements, in seconds.
    """
    while True:
        # Get the current mouse position
        x, y = pyautogui.position()
        
        # Calculate the distance to the target
        distance_x = target_x - x
        distance_y = target_y - y
        
        # If the mouse is close enough to the target, break the loop
        if abs(distance_x) < max_step and abs(distance_y) < max_step:
            pyautogui.moveTo(target_x, target_y)  # Ensure it ends exactly at the target
            break

        # Calculate the next step towards the target with corrected logic
        step_x = random.randint(max(-max_step, min(distance_x, max_step)), min(max_step, max(distance_x, -max_step)))
        step_y = random.randint(max(-max_step, min(distance_y, max_step)), min(max_step, max(distance_y, -max_step)))

        # Move the mouse to the new position
        pyautogui.moveTo(x + step_x, y + step_y, duration=random.uniform(0.1, 0.3))
        
        # Pause for a random time to mimic a human
        time.sleep(random.uniform(sleep_min, sleep_max))
        
    
    pyautogui.press('tab')
    i = 0
    while not check_for_captcha_complete('/app/captcha/pepboys_solved.png'):
        pyautogui.click()
        pyautogui.mouseDown()
        # pyautogui.keyDown('enter')
        debug(f"captcha not solved")
        time.sleep(random.randint(5, 9))
        if i >= 3:
            debug(f"i >= 3, break")
            pyautogui.mouseUp()
            break
        i = i + 1
    debug(f"captcha solved release enter")
    # pyautogui.keyUp('enter')
    pyautogui.mouseUp()
        
def move_mouse_to_element(image_path):
    """
    Locate an element on the screen using its image and move the mouse to it in a human-like manner.

    :param image_path: The file path to the image of the element to locate.
    """
    try:
        # Locate the element on the screen
        location = pyautogui.locateOnScreen(image_path, confidence=0.8)
        if location is not None:
            # Calculate the center of the element
            center_x, center_y = pyautogui.center(location)
            # Move the mouse to the center of the element
            human_like_mouse_movement_to_target(center_x, center_y)
        else:
            debug("Element not found on screen.")
    except Exception as e:
        debug(f"An error occurred: {e}")

def main():
    message_image = '/app/captcha/pepboys.png'  # Replace with the path to your screenshot
    mouse_target_image = '/app/captcha/pepboys_center_of_target.png'  # Replace with the path to your screenshot
    duration = 3  # Duration for human_like_mouse_movement
    while True:
        if check_for_message(message_image):
            debug("Message detected on screen, executing mouse movement.")
            move_mouse_to_element(image_path=mouse_target_image)
        else:
            debug("Message not detected, sleeping for a bit.")
            human_like_mouse_movement(duration=duration)
            # time.sleep(5)  # Wait a bit before checking again to avoid constant CPU usage

if __name__ == "__main__":
    main()
    # test