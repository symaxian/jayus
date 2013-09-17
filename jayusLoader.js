/*
 * Useful when testing, just import this script rather than importing every script individually or the compiled version.
 * <br> The client code needs to be loaded after this file from its own script tag[s], possibly asynchronously.
 * <br> Works by looking for the script tag in the document that loaded this file and appends the jayus source script tags after it.
 */

(function(document){

	var files = [

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

	];

	// Get the jayus loader script tag
	var tag, tags = document.getElementsByTagName('script');
	for(var i=0;i<tags.length;i++){
		if(tags[i].src.indexOf('jayusLoader.js')+1){
			tag = tags[i];
			break;
		}
	}

	// Get the jayus directory
	var basePath = tag.src.split('jayusLoader.js')[0];

	// Get the element after the jayusLoader.js tag
	var currentElement = tag.nextSibling;

	// Loop through the jayus file list
	for(i=0;i<files.length;i++){
		// Create an asynchronous script tag for the filename
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = false;
		script.src = basePath+'source/'+files[i];
		// Insert it after the last script tag
		document.head.insertBefore(script,currentElement);
	}

})(document);
