{
  "class"   : "Grid",
  "rows"    : 3,
  "cols"    : 1,
  "padding" : 2,
  "childs"  : [
    {
      "class"    : "GroupBox",
      "title"    : "Задачи на контесте",
      "childs"   : [
        {"class" : "Label",
         "text"  : "Здесь будет список задач"}
      ]
    },
    {
      "class"     : "GroupBox",
      "title"     : "Браузер задач",
      "collapsed" : true,
      "childs" : [
        {
          "class"  : "Grid",
          "rows"   : 2,
          "cols"   : 1,
          "padding" : 2,
          "childs" : [
              {"class" : "Label",
               "text"  : "Здесь будет список с задачами"},
              {
                "class"    : "Grid",
                "rows"     : 1,
                "cols"     : 2,
                "padding"  : 2,
                "childs"   : [
                  {"class" : "Entry",
                   "image" : "pics/buttons/search.gif",
                   "shadowText" : "Поиск..."},
                  {"class" : "Button",
                   "title" : "Создать",
                   "image" : "pics/buttons/add.gif"
                  }
                ]
            }
          ]
        }
      ]
    }
  ]
}
