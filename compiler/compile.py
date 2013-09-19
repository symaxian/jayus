#!/usr/bin/python

import sys
import os
import getopt
import shutil

# The order in which to compile the files
#   Taken from jayusLoader.js
FILE_PRIORITY = [

    'argumentOverloading.min.js',
    'jayus.js',
    'easing.js',
    'Responder.js',

    'Animator.js',

    'Dependency.js',
    'List.js',

    'Color.js',
    'Brush.js',
    'Gradient.js',

    'Matrix.js',
    'SizePolicy.js',

    'images.js',
    'objects.js',
    'keyboard.js',

    'Shape.js',
    'Point.js',
    'Rectangle.js',
    'Circle.js',
    'Polygon.js',
    'Path.js',

    'Entity.js',
    'RectEntity.js',
    'PaintedShape.js',

    'Text.js',
    'TextBox.js',
    'Grid.js',

    'Image.js',
    'Sprite.js',
    'SpriteSheet.js',
    'Surface.js',

    'Group.js',
    'Wrapper.js',

    'Layer.js',
    'Scene.js',
    'Display.js',

    'Frame.js',
    'EditableFrame.js',

    'FlowLayout.js',
    'Stack.js',
    'Box.js',

    'TiledMap.js'

]

DEBUG = False                   # Whether or not to print verbose information

TEMP_DIR = 'temp'               # The name of the directory to place temporary file into

REMOVE_TEMP_DIR = True          # Whether or not to delete the temporary directory after compilation

VERSION_FILE = 'jayus.js'       # The file to look in for the version tag'

VERSION_TAG = '@version '       # The tag that marks the beginning of the version string
                                #   The version string must immediately follow the version tag
                                #   The version tag must be at the beginning of the line



def getVersion():

    inputFile = open(os.path.join(INPUT_DIR, VERSION_FILE))
    data = inputFile.readlines()
    inputFile.close()

    for line in data:
        if line.startswith(VERSION_TAG):
            version = line[len(VERSION_TAG):-1]
            if DEBUG:
                print 'Version: '+version
            return version

    print 'ERROR: Version tag "'+VERSION_TAG+'" not found in file "'+VERSION_FILE+'"'
    exit()


def loadFiles():

    # Initiate some variables

    filenames = []
    fileData = {}

    # Get the files

    if DEBUG:
        print 'Reading files in from directory "'+INPUT_DIR+'"'

    filenames = os.listdir(INPUT_DIR)

    for filename in filenames:

        inputFile = open(os.path.join(INPUT_DIR, filename))
        fileData[filename] = inputFile.read()
        inputFile.close()

    return (filenames, fileData)


# Define the compile function

def compileJS(filenames, fileData, outputFile, compilationLevel, definitions=[]):

    if DEBUG:
        print 'Compiling code'
        print 'Input directory: '+INPUT_DIR
        print 'Output file: '+outputFile
        print 'Temporary directory: '+TEMP_DIR
        print 'Tags to define: '+str(definitions)
        print 'Compilation Level: '+compilationLevel
        print

    # Preprocess

    cmd = 'python '+jsmacroFile+' --srcdir '+INPUT_DIR+' --dstdir '+TEMP_DIR
    for tag in definitions:
        cmd = cmd + ' --def '+tag

    os.system(cmd)

    # Compile the javascript

    if DEBUG:
        print 'Compiling into file "'+outputFile+'"'

    compileCommand = 'java -jar ClosureCompiler.jar --compilation_level '+compilationLevel
    filenames = os.listdir(TEMP_DIR)
    for filename in FILE_PRIORITY:
        if filename in filenames:
            compileCommand += ' --js='+os.path.join(TEMP_DIR, filename)
            filenames.remove(filename)
    for filename in filenames:
        compileCommand += ' --js='+os.path.join(TEMP_DIR, filename)

    compileCommand += ' --js_output_file='+outputFile

    if DEBUG:
        print '    '+compileCommand
        print

    os.system(compileCommand)

if __name__ == '__main__':

    try:
        opts, args = getopt.getopt(
            sys.argv[1:],
            "hf:s:d:",
            ["help", "jsmacro=", "srcdir=", "dstdir="]
        )
    except getopt.GetoptError as err:
        print(str(err))
        print(__usage__)
        sys.exit(2)

    # Handle parameters

    INPUT_DIR = '../source'         # The directory to compile the code from

    OUTPUT_DIR = '../compiled/'

    # Get the version

    # version = getVersion()
    version = 'latest'

    # OUTPUT_DIR_2 = '../jayus/compiled/'

    jsmacroFile = 'jsmacro.py'

    for o, a in opts:

        if o == "-h" or o == "--help":
            print("TODO")
            sys.exit(0)

        if o == "--jsmacro":
            jsmacroFile = a

        if o == "--srcdir":
            INPUT_DIR = a

        if o == "--dstdir":
            OUTPUT_DIR = a

        if o == "-version" or o == "-v":
            version = a

    # Create the temporary directory

    if DEBUG:
        print
        print 'Creating temporary directory "'+TEMP_DIR+'"'

    if os.path.isdir(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)

    os.mkdir(TEMP_DIR)

    # Load the files

    result = loadFiles()
    filenames = result[0]
    fileData = result[1]

    # Compile multiple versions of the code
    compileJS(filenames, fileData, OUTPUT_DIR+'jayus-'+version+'-debug.min.js', 'WHITESPACE_ONLY', ['DEBUG'])
    compileJS(filenames, fileData, OUTPUT_DIR+'jayus-'+version+'.min.js', 'SIMPLE_OPTIMIZATIONS')

    # Remove the temporary directory
    if REMOVE_TEMP_DIR:
        shutil.rmtree(TEMP_DIR)
