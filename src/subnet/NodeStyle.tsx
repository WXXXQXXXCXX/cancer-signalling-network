
export const node_html = [
    {
        query: ".groupIcon",
        halign: "center",
        valign: "center",
        halignBox: "center",
        valignBox: "center",
        tpl: function (data: any) {
          return `<div class="group ${data.collapsedChildren ? "show" : "hide"}">
                    <span class="element-node_num">
                      ${data.id}
                    </span>
                    <span class="group-graphic">
                      <i class="icon icon-${data.type}"></i>
                      <span class="overlay"></span>
                    </span>
                    
                  </div>`;
        }
    },
    {
        query: ".nodeIcon",
        halign: "center",
        valign: "center",
        halignBox: "center",
        valignBox: "center",
        tpl: function (data: any) {
          return `<div class="element">
                    <span class="element-node_num">
                      ${data.id}
                    </span>
                    <span class="element-graphic">
                      
                      <span class="overlay"></span>
                    </span>
                    
                  </div>`;
        }
      },
      {
        query: ".nodeIcon.hover",
        halign: "center",
        valign: "center",
        halignBox: "center",
        valignBox: "center",
        tpl: function (data: any) {
          return `<div class="element">
                    <span class="element-node_num">
                      ${data.id}
                    </span>
                    
                    <span class="element-graphic hover">
                      
                      <span class="overlay"></span>
                    </span>
                    
                  </div>`;
        }
      }
]