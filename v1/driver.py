import turtle
import code
import sys

import pathlib
import importlib.util
import argparse

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('files', metavar='FILES', type=pathlib.Path, nargs='*')
args = parser.parse_args()

screen = turtle.Screen()
canvas = screen.getcanvas()
tk = canvas.winfo_toplevel()
tk.attributes('-fullscreen', True)

screen.title("Python Turtle on Replit")
screen.setup(1.0, 1.0)

print("Python turtle on Replit")
modules = []
for path in args.files:
	spec = importlib.util.spec_from_file_location(path.stem, path)
	module = importlib.util.module_from_spec(spec)
	spec.loader.exec_module(module)
	modules.append(module)

locals = {}
if len(modules) > 0:
	main = modules[0]
	locals = {attr: getattr(main, attr) for attr in dir(main)}

sys.ps1 = "\u001b[33m\uEEA7\u001b[00m "
code.interact(local=locals, banner='')

screen.mainloop()
