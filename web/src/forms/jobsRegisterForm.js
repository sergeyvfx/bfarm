{
  "class": "GroupBox",
  "title": "Register job",
  "name": "registerJobPanel",
  "childs": [
    {
      "class": "Grid",
      "cols": 2,
      "rows": 6,
      "padding": 2,
      "cellStyles": [[{"width": 150}], [], [{"colspan": 2}], [], [{"colspan": 2}]],
      "childs": [
        {"class": "Label", "text": "Title"},
        {"class": "Entry", "binding": "#jobTitle"},
        {"class": "Label", "text": "Type"},
        {"class": "ComboBox",
         "items": [{"title": "Animation", "tag": "anim", "toString": "field:title", "image": "/pics/buttons/animation.gif"},
                   {"title": "Still", "tag": "still", "toString": "field:title", "image": "/pics/buttons/image.gif"}],
         "events": {"onItemSelected": {"handler": "jobs.register.onTypeChanged"}},
         "binding": "#jobType"
        },
        {"class": "Panel",
         "withBorder": false,
         "childs": [
                     {"class": "Panel",
                      "withBorder": false,
                      "name": "animSettingsPanel",
                      "childs": ["url://src/forms/animationSettings.js"]},
                     {"class": "Panel",
                      "withBorder": false,
                      "visible": false,
                      "name": "stillSettingsPanel",
                      "childs": ["url://src/forms/stillSettings.js"]}
                   ]
        },
        {"class": "Label", "text": "File"},
        {"class": "FileEntry", "binding": "#jobBlenfile"},
        {"class": "Button",
         "title": "Register",
         "image": "/pics/buttons/add.gif",
         "events": {"onClick": {"handler": "jobs.register.submit"}}
        }
      ]
    }
  ]
}