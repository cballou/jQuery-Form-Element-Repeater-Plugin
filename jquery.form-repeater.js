/**
 * jQuery Form Repeater Plugin 0.1.0
 *
 * Copyright (c) 2011 Corey Ballou
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Example Usage:
 *
 <div class="container">
 <div class="r-group">
 <p>
 <label for="vehicle_0_0" data-pattern-text="Vehicle Name +=:">Vehicle Name 1:</label>
 <input type="text" name="vehicle[0][name]" id="vehicle_0_name" data-pattern-name="vehicle[++][name]" data-pattern-id="vehicle_++_name" />
 </p>
 <p>
 <label for="vehicle_0_0" data-pattern-text="Vehicle Type +=:">Vehicle Type 1:</label>
 <input type="text" name="vehicle[0][type]" id="vehicle_0_type" data-pattern-name="vehicle[++][type]" data-pattern-id="vehicle_++_type" />
 </p>
 <p>
 <-- Add a remove button for the item. If one didn't exist, it would be added to overall group -->
 <button type="button" class="r-btnRemove">Remove -</button>
 </p>
 </div>
 <button type="button" class="r-btnAdd">Add +</button>
 </div>
 <script type="text/javascript">
 $('.container').repeater({
	btnAddClass: 'r-btnAdd',
	btnRemoveClass: 'r-btnRemove',
	groupClass: 'r-group',
	minItems: 1,
	maxItems: 0,
	startingIndex: 0,
	reindexOnDelete: true,
	repeatMode: 'append',
	animation: null,
	animationSpeed: 400,
	animationEasing: 'swing',
	clearValues: true
});
 </script>
 */
(function($) {

    $.fn.repeater = function(options, data) {
        var $container = $(this),
            $btnAdd, $btnRemove, patternName, patternId, patternText,
            idVal, nameVal, labelText, labelFor, $elem, elemName,
            $label, row, $newClone, $formElems;

        $container.opts = $.extend({}, $.fn.repeater.defaults, options);
        $container.repeatCount = 0;

        $btnAdd = $container.find('.' + $container.opts.btnAddClass);
        if (!$btnAdd.length) {
            alert('You must specify a valid jQuery selector for the add button option in Form Repeater.');
            return false;
        }

        // parse out group details
        $container.group = $('.' + $container.opts.groupClass);
        if (!$container.group.length) {
            alert('You must specify a valid jQuery selector for the form element grouping option in Form Repeater.');
            return false;
        }

        // ensure the remove button exists
        $btnRemove = $container.group.find('.' + $container.opts.btnRemoveClass);
        if (!$btnRemove.length) {
            $btnRemove = $('<button type="button" name="rBtnRemove" class="' + $container.opts.btnRemoveClass + '" style="display:none" />')
            $btnRemove.appendTo($container);
        } else {
            // default hidden
            $btnRemove.hide();
        }

        // narrow the group down to the first copy
        $container.group = $container.group.eq(0);
        // retrieve form elements
        $container.groupClone = $container.group.clone();
        // remove the initial item when minItems === 0
        if ($container.opts.minItems === 0) {
            // remove the group that describes the repeat
            $container.group.remove();
            // adjust the count to remove first item
            $container.repeatCount--;
        }

        // watch for remove
	$container.on('click', '.' + $container.opts.btnRemoveClass, $container, removeRepeater);
        // watch for add
	$container.on('click', '.' + $container.opts.btnAddClass, $container, addRepeater);

        // allows for initial population of form data
        if (data && data.length) {
            // create grouping for every row of data
            data.forEach(function(condition, row) {
                // keep cloning
                $newClone = $container.groupClone.clone();
                $newClone = _reindex($newClone, row, $container);

                if ($.isFunction($container.opts.beforeAdd)) {
                    $newClone = $container.opts.beforeAdd.call(this, $newClone);
                }

                $formElems = $newClone.find(':input');

                if ($formElems.length) {
                    // populate each input field
                    $formElems.each(function() {
                        $elem = $(this),
                            elemName = $elem.attr('name');

                        // check for matching value
                        if (typeof data[row][elemName] != 'undefined') {
                            if ($elem.is('input[type="checkbox"]')) {
                                if (data[row][elemName] === '' || data[row][elemName] === '1') {
                                    $elem.attr('checked', true);
                                }
                            } else {
                                $elem.val(data[row][elemName]);
                            }
                        } else {
                            if ($elem.is('input[type="checkbox"]')) {
                                $elem.attr('checked', false);
                            } else {
                                $elem.val('');
                            }
                        }

                        patternName = $elem.data('pattern-name');
                        if (patternName) {
                            nameVal = $elem.attr('name');
                            nameVal = parsePattern(patternName, nameVal, row, $container);
                            $elem.attr('name', nameVal);
                        }

                        patternId = $elem.data('pattern-id');
                        if (patternId) {
                            idVal = $elem.attr('id');
                            idVal = parsePattern(patternId, idVal, row, $container);
                            $elem.attr('id', idVal);
                        }

                        $label = $newClone.find('label[for=' + $elem.attr('id') + ']');
                        if (!$label.length) $label = $elem.parent('label');
                        if (!$label.length) $label = $elem.siblings('label');
                        if ($label.length) {
                            // ensure we have one copy
                            $label = $label.eq(0);
                            // update label text
                            patternText = $label.data('pattern-text');
                            labelText = $label.html();
                            if (labelText) {
                                labelText = parsePattern(patternText, labelText, row, $container);
                                $label.html(labelText);
                            }
                            // update label attribute
                            labelFor = $label.attr('for');
                            if (labelFor && idVal) {
                                $label.attr('for', idVal);
                            }
                        }
                    });

                }

                // append repeater to container
                if ($container.opts.repeatMode == 'append') {
                    $newClone.appendTo($container);
                } else if ($container.opts.repeatMode == 'prepend') {
                    $newClone.prependTo($container);
                } else if ($container.opts.repeatMode == 'insertAfterLast') {
                    $newClone.insertAfter($container.find('.' + $container.opts.groupClass).last());
                }

                // remove the initial dom container
                if ($container.group) {
                    $container.group.remove();
                    $container.group = null;
                }

                // calculate the repeatCount based on whats in the dom
                $container.repeatCount = $container.find('.' + $container.opts.groupClass).length - 1;

                // shows removal buttons only inside the new clone when were above the minItems count
                if ($container.repeatCount > $container.opts.minItems - 1) {
                    $newClone.find('.' + $container.opts.btnRemoveClass).show();
                }

                if ($.isFunction($container.opts.afterAdd)) {
                    $container.opts.afterAdd.call(this, $newClone);
                }
            });
        }

        // ensure the $container is repeated for atleast the min-items amount
        if ($container.opts.showMinItemsOnLoad === true && $container.repeatCount < $container.opts.minItems - 1) {
            while ($container.repeatCount < $container.opts.minItems - 1) {
                $('.' + $container.opts.btnAddClass, $container).trigger('click');
            }
        }


        // daisy chain
        return this;
    }

    /**
     * Add a new repeater.
     */
    function addRepeater(data) {
        var container = data.data,
            tmpCount = container.repeatCount + 1,
            $doppleganger = container.groupClone.clone();

        if ($.isFunction(container.opts.beforeAdd)) {
            $doppleganger = container.opts.beforeAdd.call(this, $doppleganger);
        }

        // don't exceed the max allowable items
        if (container.opts.maxItems > 0 && container.repeatCount == container.opts.maxItems) {
            alert('You have hit the maximum allowable items.');
            return false;
        }

        _reindex($doppleganger, tmpCount, container);

        // shows removal buttons only inside the new clone when were above the minItems count
        if (container.repeatCount >= container.opts.minItems - 1) {
            $doppleganger.find('.' + container.opts.btnRemoveClass).show();
        }

        // append repeater to container
        if (container.opts.repeatMode == 'append') {
            $doppleganger.appendTo(container);
        } else if (container.opts.repeatMode == 'prepend') {
            $doppleganger.prependTo(container);
        } else if (container.opts.repeatMode == 'insertAfterLast') {
            $doppleganger.insertAfter(container.find('.' + container.opts.groupClass).last());
        }

        container.repeatCount++;

        if ($.isFunction(container.opts.afterAdd)) {
            container.opts.afterAdd.call(this, $doppleganger);
        }

        return false;
    }

    /**
     * Remove a repeater.
     */
    function removeRepeater(data) {
        var $btn = $(this),
            container = data.data,
            $repeaters = container.find('.' + container.opts.groupClass),
            numRepeaters = $repeaters.length,
            $match;

        if (numRepeaters <= container.opts.minItems) {
            return false;
        }

        // check if removing a specific repeater instance
        $match = $btn.closest('.' + container.opts.groupClass);
        if (!$match.length) {
            // determine if removing first or last repeater
            if (container.opts.repeatMode == 'append') {
                var $match = $repeaters.filter(':last');
            } else if (container.opts.repeatMode == 'prepend') {
                var $match = $repeaters.filter(':first');
            } else if (container.opts.repeatMode == 'insertAfterLast') {
                var $match = $repeaters.filter(':last');
            }
        }

        // ensure we have a match
        if ($match.length) {
            // remove the repeater
            if (container.opts.animation) {
                if (container.opts.animation == 'slide') {
                    $match.slideUp(container.opts.animationSpeed, container.opts.animationEasing, function() {
                        _remove($match, container);
                    });
                } else if (container.opts.animation == 'fade') {
                    $match.fadeOut(container.opts.animationSpeed, container.opts.animationEasing, function() {
                        _remove($match, container);
                    });
                } else if (typeof container.opts.animation == 'object') {
                    $match.animate(container.opts.animation, container.opts.animationSpeed, container.opts.animationEasing, function() {
                        _remove($match, container);
                    });
                }
            } else {
                _remove($match, container);
            }
        }

        return false;
    }

    /**
     * Parse the pattern.
     */
    function parsePattern(pattern, replaceText, count, container) {
        var returnVal = replaceText;

        count = parseInt(count);
        if (pattern) {
            // check pattern type
            if (pattern.indexOf('+=') > -1) {
                var matches = pattern.match(/\+=(\d+)/i);
                if (matches && matches.length && matches[1]) {
                    var incr = parseInt(matches[1]);
                    returnVal = pattern.replace(/\+=(\d)+/i, container.opts.startingIndex + count + incr);
                }
            }

            if (pattern.indexOf('++') > -1) {
                returnVal = pattern.replace(/\+\+/gi, container.opts.startingIndex + count);
            }
        }
        return returnVal;
    }

    /**
     * Wrapper to handle re-indexing form elements in a group.
     */
    function reindex(container) {
        var $repeaters = container.find('.' + container.opts.groupClass),
            startIndex = container.opts.startingIndex,
            $curGroup;

        $repeaters.each(function() {
            $curGroup = $(this);
            _reindex($curGroup, startIndex, container);
            startIndex++;
        });
    }

    /**
     * Remove a match and reindex.
     */
    function _remove($match, container) {
        if ($.isFunction(container.opts.beforeDelete)) {
            container.opts.beforeDelete.call(this, $match);
        }

        $match.remove();

        if (typeof container.repeatCount === "number") {
            container.repeatCount--;
        }

        if (container.opts.reindexOnDelete) {
            reindex(container);
        }

        if ($.isFunction(container.opts.afterDelete)) {
            container.opts.afterDelete.call(this, $match);
        }
    }

    /**
     * Handle reindexing each form element in a group.
     */
    function _reindex($curGroup, index, container) {
        var $formElems = $curGroup.find(':input'),
            patternName, patternId, patternText,
            idVal, nameVal, $label, labelText, labelFor,
            $elem;

        if ($formElems.length) {
            $formElems.each(function() {
                $elem = $(this);

                patternName = $elem.data('pattern-name');
                if (patternName) {
                    nameVal = $elem.attr('name');
                    nameVal = parsePattern(patternName, nameVal, index, container);
                    $elem.attr('name', nameVal);

                    if ($elem.is('input[type="checkbox"]') || $elem.is('input[type="radio"]')) {
                        if ($elem.prop('checked')) {
                            $elem.attr('checked', true);
                        } else {
                            $elem.attr('checked', false);
                        }
                    }
                }

                patternId = $elem.data('pattern-id');
                if (patternId) {
                    idVal = $elem.attr('id');
                    idVal = parsePattern(patternId, idVal, index, container);
                    $elem.attr('id', idVal);
                }

                $label = $curGroup.find('label[for=' + $elem.attr('id') + ']');
                if (!$label.length) $label = $elem.parent('label');
                if (!$label.length) $label = $elem.siblings('label');
                if ($label.length) {
                    // ensure we have one copy
                    $label = $label.eq(0);
                    // update label text
                    patternText = $label.data('pattern-text');
                    labelText = $label.html();
                    if (labelText) {
                        labelText = parsePattern(patternText, labelText, index, container);
                        $label.html(labelText);
                    }
                    // update label attribute
                    labelFor = $label.attr('for');
                    if (labelFor && idVal) {
                        $label.attr('for', idVal);
                    }
                }
            });
        }

        return $curGroup;
    }

})(jQuery);

// default values
$.fn.repeater.defaults = {
    groupClass: 'r-group',
    btnAddClass: 'r-btnAdd',
    btnRemoveClass: 'r-btnRemove',
    minItems: 1,
    maxItems: 0,
    startingIndex: 0,
    reindexOnDelete: true,
    showMinItemsOnLoad: false,
    repeatMode: 'insertAfterLast', // append, prepend, insertAfterLast
    animation: null,
    animationSpeed: 400,
    animationEasing: 'swing',
    clearValues: true,
    beforeAdd: function($doppleganger) {
        return $doppleganger;
    },
    afterAdd: function($doppleganger) {},
    beforeDelete: function($elem) {},
    afterDelete: function() {}
};
