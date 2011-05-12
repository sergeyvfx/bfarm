{
  "class": "Grid",
  "cols": 2,
  "rows": 4,
  "padding": 2,
  "cellStyles": [[{"width": 150}], [{"colspan": 2}], [{"colspan": 2}], [{"colspan": 2}]],
  "childs": [
    {"class": "Label", "text": "Title"},
    {"class": "Entry", "binding": "#jobTitle"},
    {"class": "GroupBox",
     "title": "Input parameters",
     "childs": [{"class": "Grid",
                  "rows": 4,
                  "cols": 2,
                  "padding": 2,
                  "cellStyles": [[{"width": 150}], [{"colspan": 2, "padding": 0}], [], [{"colspan": 2}]],
                  "childs": [
                             {"class": "Label", "text": "Source"},
                             {"class": "RadioGroup",
                              "binding": "#jobSource",
                              "value": "FILE",
                              "events": {"onChanged": {"handler": "jobs.register.onSourceChanged"}},
                              "items": [{"title": "File", "value": "FILE"},
                                        {"title": "SVN repo", "value": "SVN"}
                                       ]},

                             {"class": "Panel",
                              "withBorder": false,
                              "childs": [{"class": "Panel",
                                          "withBorder": false,
                                          "name": "fileSettingsPanel",
                                          "childs": ["url://src/forms/fileSettings.js"]},
                                         {"class": "Panel",
                                          "withBorder": false,
                                          "visible": false,
                                          "name": "svnSettingsPanel",
                                          "childs": ["url://src/forms/svnSettings.js"]}
                                        ]
                             },

                             {"class": "Label", "text": "Render type"},
                             {"class": "ComboBox",
                              "items": [{"title": "Animation", "tag": "anim", "toString": "field:title", "image": "/pics/buttons/animation.gif"},
                                        {"title": "Still", "tag": "still", "toString": "field:title", "image": "/pics/buttons/image.gif"}],
                              "events": {"onItemSelected": {"handler": "jobs.register.onTypeChanged"}},
                              "binding": "#jobType"},
                             {"class": "Panel",
                              "withBorder": false,
                              "childs": [{"class": "Panel",
                                          "withBorder": false,
                                          "name": "animSettingsPanel",
                                          "childs": ["url://src/forms/animationSettings.js"]},
                                         {"class": "Panel",
                                          "withBorder": false,
                                          "visible": false,
                                          "name": "stillSettingsPanel",
                                          "childs": ["url://src/forms/stillSettings.js"]}
                                        ]
                             }
                            ]
                }
               ]
    },
    {"class": "GroupBox",
     "title": "Output parameters",
     "childs": [{"class": "Grid",
                 "rows": 1,
                 "cols": 4,
                 "padding": 2,
                 "cellStyles": [[{"width": "100"}, {}, {"width": "142", "padding": [0, 0, 0, 42]}]],
                 "childs": [{"class": "Label", "text": "File format"},
                            {"class": "ComboBox",
                             "binding": "#jobFileFormat",
                             "items": [{"title": "PNG", "tag": "PNG", "toString": "field:title"},
                                       {"title": "JPEG", "tag": "JPEG", "toString": "field:title"},
                                       {"title": "OpenEXR", "tag": "OPEN_EXR", "toString": "field:title"}
                                      ]},
                            {"class": "Label", "text": "Color mode"},
                            {"class": "ComboBox",
                             "active": 1,
                             "binding": "#jobColorMode",
                             "items": [{"title": "BW", "tag": "BW", "toString": "field:title"},
                                       {"title": "RGB", "tag": "RGB", "toString": "field:title"},
                                       {"title": "RGBA", "tag": "RGBA", "toString": "field:title"}
                                      ]}
                            ]},
                {"class": "Grid",
                 "rows": 3,
                 "cols": 2,
                 "padding": 2,
                 "cellStyles": [[{"width": "100"}]],
                 "childs": [{"class": "Label", "text": "Resolution"},
                            {"class": "Grid",
                             "cols": 2,
                             "cellStyles": [[{"padding": [0, 30, 0, 0]}, {"padding": [0, 0, 0, 30]}]],
                             "childs": [{"class": "Grid",
                                         "cols": 2,
                                         "cellStyles": [[{"width": 40}]],
                                         "childs": [{"class": "Label", "text": "X"},
                                                    {"class": "SpinButton", "min": 4, "max": 10000, "binding": "#jobResolX", "value": 2048}
                                                   ]
                                        },
                                        {"class": "Grid",
                                         "cols": 2,
                                         "cellStyles": [[{"width": 40}]],
                                         "childs": [{"class": "Label", "text": "Y"},
                                                    {"class": "SpinButton", "min": 4, "max": 10000, "binding": "#jobResolY", "value": 872}
                                                   ]
                                        }
                                        ]},
                            {"class": "Label", "text": "Percentage"},
                            {"class": "SpinButton", "min": 1, "max": 100, "binding": "#jobPercentage", "value": 50}
                           ]
                }
               ]
    },
    {"class": "Grid",
     "cols": 2,
     "rows": 1,
     "cellStyles": [[{"padding": [0, 2, 0, 0]}, {"padding": [0, 0, 0, 2]}]],
     "childs": [{"class": "Button",
                 "title": "Register",
                 "image": "/pics/buttons/add.gif",
                 "events": {"onClick": {"handler": "jobs.register.submit"}}
                },
                {"class": "Button",
                 "title": "Cancel",
                 "events": {"onClick": {"handler": "jobs.register.hide"}}
                }
               ]
    }
  ]
}
