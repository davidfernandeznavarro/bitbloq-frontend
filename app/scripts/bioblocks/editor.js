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
  "type": "numbers_time_of_op",
  "message0": "Time of Operation %1",
  "args0": [
    {
      "type": "field_number",
      "name": "NAME",
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
  "message0": " %1",
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
  "type": "extra_settings",
  "message0": "Settings %1 %2 %3",
  "args0": [
    {
      "type": "field_checkbox",
      "name": "NAME",
      "checked": true
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "NAME"
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
  "message0": "New Operation %1 %2 %3",
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
      "name": "NAME"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "Block to create a new Bioblock Operation",
  "helpUrl": ""
}]);