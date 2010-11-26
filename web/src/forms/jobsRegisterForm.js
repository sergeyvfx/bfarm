{
  "class": "GroupBox",
  "title": "Register job",
  "childs": [
    {
      "class": "Grid",
      "cols": 2,
      "rows": 4,
      "padding": 2,
      "childs": [
        {"class": "Label", "text": "Title"},
        {"class": "Entry"},
        {"class": "Label", "text": "Type"},
        {"class": "ComboBox", "items": ["Animation", "Still"]},
        {"class": "Label", "text": "Frame range"},
        {"class": "Grid",
         "cols": 2,
         "childs": [
           {"class": "SpinButton", "min": -32768, "max": 32768},
           {"class": "SpinButton", "min": -32768, "max": 32768}
         ]
        },
        {"class": "Button", "title": "Register", "image": "/pics/buttons/add.gif"}
      ]
    }
  ]
}