'use strict';

//goog.provide('Blockly.Blocks.colour');  // Deprecated
//goog.provide('Blockly.Constants.Colour');

goog.require('Blockly.Blocks');
goog.require('Blockly');


/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg.COLOUR_HUE. (2018 April 5)
 */
Blockly.Constants.Colour.HUE = 20;

Blockly.defineBlocksWithJsonArray([ // BEGIN JSON EXTRACT
{
  "type": "source",
  "message0": "Source %1",
  "args0": [
    {
      "type": "input_value",
      "name": "INPUTNAMES"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 45,
  "tooltip": "Input Container",
  "helpUrl": ""
},
{
  "type": "destination",
  "message0": "Destination %1",
  "args0": [
    {
      "type": "input_value",
      "name": "INPUTNAMES"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 45,
  "tooltip": "Output Container",
  "helpUrl": ""
},
{
  "type": "numbers_var",
  "message0": "%1 %2",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": "Variable"
    },
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "numbers_time_of_op",
  "message0": "Time of Operation %1",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "numbers_cycles",
  "message0": "Cycles %1",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "numbers_wavelength",
  "message0": "Wavelength Number %1",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "numbers_sequence",
  "message0": "Sequence %1",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "numbers_co2",
  "message0": "CO2 Percentage %1",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0,
      "min": 0,
      "max": 100
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "numbers_speed",
  "message0": "Speed %1 RPM",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0,
      "min": 0,
      "max": 100
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 20,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "strings_ladder",
  "message0": "Ladder %1",
  "args0": [
    {
      "type": "field_input",
      "name": "TEXT",
      "text": " --- "
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "string_var",
  "message0": "%1 %2",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": "Variable"
    },
    {
      "type": "field_input",
      "name": "TEXT",
      "text": " --- "
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "strings_dest",
  "message0": "Destination %1",
  "args0": [
    {
      "type": "field_input",
      "name": "TEXT",
      "text": " --- "
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "strings_scale",
  "message0": "Scale %1",
  "args0": [
    {
      "type": "field_input",
      "name": "TEXT",
      "text": " --- "
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "strings_purification",
  "message0": "Purification %1",
  "args0": [
    {
      "type": "field_input",
      "name": "TEXT",
      "text": " --- "
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "strings_mcc",
  "message0": "Min. colony count %1",
  "args0": [
    {
      "type": "field_input",
      "name": "TEXT",
      "text": " --- "
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "drop_measure",
  "message0": "Measurement Type: %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "Abrorbance",
          "OPTIONNAME"
        ],
        [
          "Fluorescence",
          "OPTIONNAME"
        ],
        [
          "Luminiscence",
          "OPTIONNAME"
        ],
        [
          "Volume",
          "OPTIONNAME"
        ],
        [
          "Temperature",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "drop_action",
  "message0": "  %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "Transfer",
          "OPTIONNAME"
        ],
        [
          "Distribute",
          "OPTIONNAME"
        ],
        [
          "Consolidate",
          "OPTIONNAME"
        ],
        [
          "Continuous Transfer",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "drop_type",
  "message0": "Type %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "Vortex",
          "OPTIONNAME"
        ],
        [
          "Shake",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "drop_temp",
  "message0": "Temperature %1 %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "Celsius",
          "OPTIONNAME"
        ],
        [
          "Kelvin",
          "OPTIONNAME"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "NUMBER",
      "value": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "drop_duration",
  "message0": "Duration %1 %2",
  "args0": [
    {
      "type": "field_number",
      "name": "NUMBER",
      "value": 0
    },
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "Milliseconds",
          "OPTIONNAME"
        ],
        [
          "Seconds",
          "OPTIONNAME"
        ],
        [
          "Minutes",
          "OPTIONNAME"
        ],
        [
          "Hours",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "extra_mix_check",
  "message0": "Mix After/Before %1",
  "args0": [
    {
      "type": "field_checkbox",
      "name": "NAME",
      "checked": true
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 300,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "check_var",
  "message0": "%1 %2",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": "Variable"
    },
    {
      "type": "field_checkbox",
      "name": "CHECK",
      "checked": true
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 300,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "new_op",
  "message0": "Operation: %1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": " --- "
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "FIELDS"
    }
  ],
  "colour": 120,
  "tooltip": "Block to create a new Bioblock Operation",
  "helpUrl": ""
}]);

Blockly.Blocks['field_dropdown'] = {
  // Dropdown menu. EDITED FOR THE EDITOR
  init: function() {
    this.appendDummyInput()
        .appendField('Name:')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.optionList_ = ['text', 'text', 'text'];
    this.updateShape_();
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setMutator(new Blockly.Mutator(['field_dropdown_option_text',
                                         'field_dropdown_option_image']));
    this.setColour(230);
    this.setTooltip('Dropdown menu with a list of options.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
  },
  mutationToDom: function(workspace) {
    // Create XML to represent menu options.
    var container = document.createElement('mutation');
    container.setAttribute('options', JSON.stringify(this.optionList_));
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    var value = JSON.parse(container.getAttribute('options'));
    if (typeof value == 'number') {
      // Old format from before images were added.  November 2016.
      this.optionList_ = [];
      for (var i = 0; i < value; i++) {
        this.optionList_.push('text');
      }
    } else {
      this.optionList_ = value;
    }
    this.updateShape_();
  },
  decompose: function(workspace) {
    // Populate the mutator's dialog with this block's components.
    var containerBlock = workspace.newBlock('field_dropdown_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.optionList_.length; i++) {
      var optionBlock = workspace.newBlock(
          'field_dropdown_option_' + this.optionList_[i]);
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Reconfigure this block based on the mutator dialog's components.
    var optionBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    this.optionList_.length = 0;
    var data = [];
    while (optionBlock) {
      if (optionBlock.type == 'field_dropdown_option_text') {
        this.optionList_.push('text');
      } else if (optionBlock.type == 'field_dropdown_option_image') {
        this.optionList_.push('image');
      }
      data.push([optionBlock.userData_, optionBlock.cpuData_]);
      optionBlock = optionBlock.nextConnection &&
          optionBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Restore any data.
    for (var i = 0; i < this.optionList_.length; i++) {
      var userData = data[i][0];
      if (userData !== undefined) {
        if (typeof userData == 'string') {
          this.setFieldValue(userData || 'option', 'USER' + i);
        } else {
          this.setFieldValue(userData.src, 'SRC' + i);
          this.setFieldValue(userData.width, 'WIDTH' + i);
          this.setFieldValue(userData.height, 'HEIGHT' + i);
          this.setFieldValue(userData.alt, 'ALT' + i);
        }
        this.setFieldValue(data[i][1] || 'OPTIONNAME', 'CPU' + i);
      }
    }
  },
  saveConnections: function(containerBlock) {
    // Store all data for each option.
    var optionBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (optionBlock) {
      optionBlock.userData_ = this.getUserData(i);
      optionBlock.cpuData_ = this.getFieldValue('CPU' + i);
      i++;
      optionBlock = optionBlock.nextConnection &&
          optionBlock.nextConnection.targetBlock();
    }
  },
  updateShape_: function() {
    // Delete everything.
    var i = 0;
    while (this.getInput('OPTION' + i)) {
      this.removeInput('OPTION' + i);
      this.removeInput('OPTION_IMAGE' + i, true);
      i++;
    }
    // Rebuild block.
    var src = 'https://www.gstatic.com/codesite/ph/images/star_on.gif';
    for (var i = 0; i <= this.optionList_.length; i++) {
      var type = this.optionList_[i];
      if (type == 'text') {
        this.appendDummyInput('OPTION' + i)
            .appendField('•')
            .appendField(new Blockly.FieldTextInput('option'), 'USER' + i)
            .appendField(',')
            .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + i);
      } else if (type == 'image') {
        this.appendDummyInput('OPTION' + i)
            .appendField('•')
            .appendField('image')
            .appendField(new Blockly.FieldTextInput(src), 'SRC' + i);
        this.appendDummyInput('OPTION_IMAGE' + i)
            .appendField(' ')
            .appendField('width')
            .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'WIDTH' + i)
            .appendField('height')
            .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'HEIGHT' + i)
            .appendField('alt text')
            .appendField(new Blockly.FieldTextInput('*'), 'ALT' + i)
            .appendField(',')
            .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + i);
      }
    }
  },
  onchange: function() {
    if (this.workspace && this.optionList_.length < 1) {
      this.setWarningText('Drop down menu must\nhave at least one option.');
    } else {
      fieldNameCheck(this);
    }
  },
  getUserData: function(n) {
    if (this.optionList_[n] == 'text') {
      return this.getFieldValue('USER' + n);
    }
    if (this.optionList_[n] == 'image') {
      return {
        src: this.getFieldValue('SRC' + n),
        width: Number(this.getFieldValue('WIDTH' + n)),
        height: Number(this.getFieldValue('HEIGHT' + n)),
        alt: this.getFieldValue('ALT' + n)
      };
    }
    throw 'Unknown dropdown type';
  }
};
