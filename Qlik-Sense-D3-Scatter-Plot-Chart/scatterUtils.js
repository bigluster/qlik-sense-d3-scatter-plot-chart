var senseUtils = {
    
    getMeasureLabel: function(n,layout) {
        return layout.qHyperCube.qMeasureInfo[n-1].qFallbackTitle;
    },

    getDimLabel: function(n,layout) {
        return layout.qHyperCube.qDimensionInfo[n-1].qFallbackTitle;
    },
    setupContainer: function($element,layout,class_name) {
        // Properties: height, width, id
        var ext_height = $element.height(),
            ext_width = $element.width(), 
            id = "ext_" + layout.qInfo.qId;

        // Initialize or clear out the container and its classes
        if (!document.getElementById(id)) {
            $element.append($("<div />").attr("id",id));
        }

        else {
        
            $("#" + id)
                .empty()
                .removeClass();

        }

        // Set the containers properties like width, height, and class
        
        $("#" + id)
            .width(ext_width)
            .height(ext_height)
            .addClass(class_name);

        return id;
    },
    extendLayout: function(layout,self) {
        var dim_count = layout.qHyperCube.qDimensionInfo.length;

        layout.qHyperCube.qDataPages[0].qMatrix.forEach(function(d) {
            d.dim = function(i) {
                return d[i-1];
            };
            d.measure = function(i) {
                return d[i+dim_count-1];
            };

            for (var i = 0; i<dim_count; i++) {
                d[i].qSelf = self;
                d[i].qIndex = i;
                d[i].qSelect = function() {
                    this.qSelf.backendApi.selectValues(this.qIndex,[this.qElemNumber],true);    
                };
                        
            };
        });
    }
};