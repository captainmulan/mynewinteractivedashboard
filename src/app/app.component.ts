import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PieArcDatum } from 'd3-shape';

interface data_Covid {
  Date: string;
  Country_Region: string;
  Country_Code: string;
  Population: number;
  Total_Confirmed_Cases: number;
  Total_Fatalities: number;
  Total_Recovered_Cases: number;
  New_Confirmed_Cases: number;
  New_Fatalities: number;
  New_Recovered_Cases: number;
  Remaining_Confirmed_Cases: number;
}

interface data_Other {
  Country_Region: string; 
  longitude: number;
  latitude: number;
  HDI: string;
  Development: string;
  IncomeGroup: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  private data_Covid: data_Covid[] = [];

  private data_Other: data_Other[] = [
    { Country_Region: "Indonesia", longitude: 117.15, latitude: -2.38, HDI: "High", Development: "Developing", IncomeGroup: "Lower middle income"},
    { Country_Region: "Singapore", longitude: 103.8, latitude: 1.35, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
    { Country_Region: "Malaysia", longitude: 101.97, latitude: 4.21, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
    { Country_Region: "Thailand", longitude: 100.99, latitude: 15.87, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
    { Country_Region: "Philippines", longitude: 121.05, latitude: 14.58, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
    { Country_Region: "Vietnam", longitude: 106.35, latitude: 10.82, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
    { Country_Region: "Cambodia", longitude: 104.91, latitude: 12.57, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
    { Country_Region: "Brunei", longitude: -1, latitude: -1, HDI: "NA", Development: "NA", IncomeGroup: "NA"},
  ];

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
    this.draw_Flag();
    this.draw_PieChart();
    this.draw_BarChart();
    this.draw_LineChart();
    this.draw_Map();

  }

  private loadData(): Promise<void> {
    return new Promise((resolve, reject) => {
      d3.json('assets/covid_data.json').then((data: any) => {
        this.data_Covid = data.map((d: any) => {
          return {
            Date: d.Date,
            Country_Region: d.Country_Region,
            Country_Code: d.Country_Code,
            Population: +d.Population,
            Total_Confirmed_Cases: +d.Total_Confirmed_Cases,
            Total_Fatalities: +d.Total_Fatalities,
            Total_Recovered_Cases: +d.Total_Recovered_Cases,
            New_Confirmed_Cases: +d.Total_Confirmed_Cases,
            New_Fatalities: +d.Total_Fatalities,
            New_Recovered_Cases: +d.Total_Recovered_Cases,
            Remaining_Confirmed_Cases: +d.Remaining_Confirmed_Cases,
          };
        });

        resolve();
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  private draw_Flag(): void {
    const svg = d3.select<SVGSVGElement, unknown>('#chart1').append('svg');
    const svgRect = svg.node()?.getBoundingClientRect();
    const svgWidth = 140, svgHeight = svgRect?.height ?? 0;
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const width = svgWidth - margin.left - margin.right, height = svgHeight - margin.top - margin.bottom;

    svg.attr('width', svgWidth).attr('height', svgHeight);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    //Tooltip
    const tooltip = d3.select('body').append('div').attr('id', 'chart3-tooltip').style('position', 'absolute').style('background-color', 'white')
    .style('border', 'solid').style('border-width', '1px').style('border-radius', '5px').style('padding', '10px').style('opacity', 0);

    const data = this.data_Other[0];

    const image = g.append("image")
      .attr("xlink:href", "assets/indonesia_flag.png")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function(event: any, d: any) {
        tooltip.style("opacity", 1)
        .html(`Country: ${data.Country_Region}
        <br>Income: ${data.IncomeGroup}
        <br>Development: ${data.Development}
        <br>HDI: ${data.HDI}      
      `)
      .style('left', (event.pageX + 10) + 'px').style('top', (event.pageY + 10) + 'px');;
      })
      .on("mouseout", function(event: any, d: any) {
        tooltip.style('opacity', 0);
      });

    // Add bottom caption
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + margin.bottom)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "baseline")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Indonesia");

  }

  private draw_PieChart(): void {
    const svg = d3.select<SVGSVGElement, unknown>('#chart2').append('svg');
    const svgWidth = 150, svgHeight = 300;
    const margin = { top: 5, right: 5, bottom: 200, left: 5 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    svg.attr('width', svgWidth).attr('height', svgHeight);
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    // Group data by Country_Region and get first row of each group
    const groupedData = Array.from(d3.group(this.data_Covid, d => d.Country_Region), ([key, value]) => ({ 
      Country_Region: key, 
      Population: value[0].Population 
    }));

    const pieGenerator = d3.pie<typeof groupedData[0]>()
    .value((d) => d.Population)
    .sort(null);

    const arcGenerator = d3.arc<any, d3.PieArcDatum<typeof groupedData[0]>>()
    .innerRadius(0)
    .outerRadius(radius);
    const pieData = pieGenerator(groupedData);
    const paths = g.selectAll('path').data(pieData).enter().append('path');

    //Tooltip
    const tooltip = d3.select('body').append('div').attr('id', 'chart3-tooltip').style('position', 'absolute').style('background-color', 'white')
    .style('border', 'solid').style('border-width', '1px').style('border-radius', '5px').style('padding', '10px').style('opacity', 0);

    paths
      .attr('d', arcGenerator)
      .attr('fill', (d) => {
        return this.getColor(d.data.Country_Region);
      })
      .on("mouseover", function(event: any, d: any) {
      d3.select(this)

      tooltip.style("opacity", 1)
        .html(`Country:${d.data.Country_Region}
        <br>Population:${d.data.Population}`)
        .style('left', (event.pageX + 10) + 'px').style('top', (event.pageY + 10) + 'px');;
      })
      .on("mouseout", function(event: any, d: any) {
        tooltip.style('opacity', 0);
      });

    d3.select('#sort-checkbox-pie').on('change', () => {
      const sortDescending = d3.select('#sort-checkbox-pie').property('checked');      
      let sortedData = groupedData;   
      sortedData = groupedData.sort((a, b) => sortDescending ? b.Population - a.Population : a.Population - b.Population);

      // Redraw Chart with filteredData
      const new_pieData = pieGenerator(sortedData);
      const paths = g.selectAll<SVGPathElement, PieArcDatum<typeof groupedData[0]>>('path').data(new_pieData);
    
      paths.enter().append('path')
        .merge(paths)
        .attr('d', arcGenerator)
        .attr('fill', (d) => {
          return this.getColor(d.data.Country_Region);
        })
        .on("mouseover", function(event: any, d: any) {
          d3.select(this)
          tooltip.style("opacity", 1)
            .html(`Country:${d.data.Country_Region}
            <br>Population:${d.data.Population}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
        })
        .on("mouseout", function(event: any, d: any) {
          tooltip.style('opacity', 0);
        });
      paths.exit().remove();
    });


    //Legend
    const legendHeight = 15;

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', (`translate(10,100)`));

    const legendItems = legend.selectAll('.legend-item')
      .data(pieData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * legendHeight})`);

    legendItems.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 5)
      .attr('height', 5)
      .attr('fill', (d, i) => this.getColor(d.data.Country_Region));

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 6)
      .style('font-size', '9px')
      .text((d) => d.data.Country_Region);     
      
  }

  private draw_BarChart(): void {
    //Margin
    const svgWidth = 480, svgHeight = 200;
    const margin = { top: 60, right: 0.5, bottom: 56, left: 40 };
    const width = svgWidth - margin.left - margin.right, height = svgHeight - margin.top - margin.bottom;

    //SVG
    const svg = d3.select<SVGSVGElement, unknown>('#chart3').append('svg');
    svg.attr('width', svgWidth).attr('height', svgHeight);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X & Y
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);
    x.domain(this.data_Covid.map(d => d.Country_Region));
    y.domain([0, d3.max(this.data_Covid, d => d.Total_Confirmed_Cases) as number]);

    //Tooltip
    const tooltip = d3.select('body').append('div').attr('id', 'chart3-tooltip').style('position', 'absolute').style('background-color', 'white')
    .style('border', 'solid').style('border-width', '1px').style('border-radius', '5px').style('padding', '10px').style('opacity', 0);

    //Events
    const mouseover = function(this: SVGRectElement, event: MouseEvent) {
      const d = d3.select(this).datum();
      tooltip.style('opacity', 1)
      .html(`Country: ${(<data_Covid>d).Country_Region} <br> Cases: ${(<data_Covid>d).Total_Confirmed_Cases} <br> Fatalities: ${(<data_Covid>d).Total_Fatalities} <br> Recovered: ${(<data_Covid>d).Total_Recovered_Cases}`)
      .style('left', (event.pageX + 10) + 'px').style('top', (event.pageY + 10) + 'px');
    };

    const mouseout = function(this: SVGRectElement) { tooltip.style('opacity', 0); };

    //Draw chart
    g.selectAll(".bar")
      .data(this.data_Covid)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Country_Region)!)
      .attr("width", x.bandwidth())
      .attr("y", y(y.domain()[1]))
      .attr("height", 0)
      .attr("fill", (d, i) => this.getColor(d.Country_Region))
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .transition()
      .duration(10)
      .delay((d, i) => i * 3)
      .attr("y", d => y(d.Total_Confirmed_Cases)!)
      .attr("height", d => height - Number(y(d.Total_Confirmed_Cases)));

    //Axis
    const xAxis = g.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));
    xAxis.selectAll("text").attr("transform", "rotate(-90)").attr("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em");

    const yAxis = g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat((d) => d3.format(".2s")(Number(d))));

    //Sort
    d3.select('#sort-checkbox').on('change', () => {
      this.sortBars(svg, width, xAxis);
    });

    // Filter by case
    d3.select('#case-dropdown-bar').on('change', () => {
    const selectedMetric = d3.select('#case-dropdown-bar').property('value') as keyof data_Covid;
    
      if (selectedMetric === "Total_Fatalities") {
        y.domain([0, d3.max(this.data_Covid, d => d.Total_Fatalities) as number]);
        g.selectAll(".bar")
          .data(this.data_Covid)
          .transition()
          .duration(100)          
          .attr("y", d => y(d.Total_Fatalities)!)
          .attr("height", d => height - Number(y(d.Total_Fatalities)));

      } 
      else if (selectedMetric === "Total_Recovered_Cases") {
        y.domain([0, d3.max(this.data_Covid, d => d.Total_Recovered_Cases) as number]);
        g.selectAll(".bar")
          .data(this.data_Covid)
          .transition()
          .duration(100)          
          .attr("y", d => y(d.Total_Recovered_Cases)!)
          .attr("height", d => height - Number(y(d.Total_Recovered_Cases)));

      }  
      else {
        y.domain([0, d3.max(this.data_Covid, d => d.Total_Confirmed_Cases) as number]);
        g.selectAll(".bar")
          .data(this.data_Covid)
          .transition()
          .duration(100)          
          .attr("y", d => y(d.Total_Confirmed_Cases)!)
          .attr("height", d => height - Number(y(d.Total_Confirmed_Cases)));
      }

    });

    // Filter by country
    d3.select('#country-dropdown-bar').on('change', () => {
      const selectedCountry = d3.select('#country-dropdown-bar').property('value');
      let filteredData: data_Covid[] = this.data_Covid;
      
      if (selectedCountry !== 'All') {
        filteredData = filteredData.filter(d => d.Country_Region === selectedCountry);
      }

      // Redraw Chart with filteredData
      y.domain([0, d3.max(filteredData, d => d.Total_Confirmed_Cases) as number]);
      x.domain(filteredData.map(d => d.Country_Region));

      const bars = g.selectAll<any, any>('.bar')
        .data(filteredData, (d: any) => d.Country_Region);

      bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.Country_Region)!)
        .attr('width', x.bandwidth())
        .attr('fill', (d, i) => this.getColor(d.Country_Region))
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .merge(bars)
        .transition()
        .duration(500)
        .attr('x', d => x(d.Country_Region)!)
        .attr("y", d => y(d.Total_Confirmed_Cases)!)
        .attr("height", d => height - Number(y(d.Total_Confirmed_Cases)));

      bars.exit().remove();

      xAxis.call(d3.axisBottom(x));
      yAxis.transition().duration(500).call(d3.axisLeft(y).ticks(5).tickFormat((d) => d3.format(".2s")(Number(d))));

    });  
  }

  private draw_LineChart(): void {
    const svg = d3.select<SVGSVGElement, unknown>('#chart4').append('svg');
    const svgWidth = 450, svgHeight = 210;
    const margin = { top: 10, right: 0.5, bottom: 60, left: 30 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    svg.attr('width', svgWidth).attr('height', svgHeight);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const parseTime = d3.timeParse("%d/%m/%Y");

    let filteredData: data_Covid[] = this.data_Covid;
    filteredData = filteredData.filter(d => d.Country_Region === "Indonesia");

    const x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([d3.min(filteredData, d => parseTime(d.Date)) as Date, d3.max(filteredData, d => parseTime(d.Date)) as Date]);

    const y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, d3.max(filteredData, d => d.Total_Confirmed_Cases) as number]);

    const line = d3.line<{ Date: string, Total_Confirmed_Cases: number }>()
      .x(d => x(parseTime(d.Date) ?? new Date(0)))
      .y(d => y(d.Total_Confirmed_Cases));
    
    //Path
    const path = g.append("path")
      .datum(filteredData)
      .attr("fill", "transparent")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    const xAxis = g.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));
    xAxis.selectAll("text").attr("transform", "rotate(-90)").attr("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em");
    g.append("g").call(d3.axisLeft(y).ticks(10).tickFormat((d) => d3.format(".2s")(Number(d))));

    // Filter by case
    d3.select('#case-dropdown-line').on('change', () => {
      const selectedMetric = d3.select('#case-dropdown-line').property('value') as keyof data_Covid;
      
        if (selectedMetric === "Total_Fatalities") {
          y.domain([0, d3.max(filteredData, d => d.Total_Fatalities) as number]);
          path.attr("d", line);  
        } 
        else if (selectedMetric === "Total_Recovered_Cases") {
          y.domain([0, d3.max(filteredData, d => d.Total_Recovered_Cases) as number]);  
        }  
        else {
          y.domain([0, d3.max(filteredData, d => d.Total_Confirmed_Cases) as number]);
        }

        path.attr("d", line);  
    });

  }

  private draw_Map(): void {
    const margin = { top: 10, right: 10, bottom: 10, left: 70 },  width = 550 - margin.left - margin.right, height = 480 - margin.top - margin.bottom;
    const svg = d3.select<SVGSVGElement, unknown>("#chart5").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div").style("position", "absolute").style("background-color", "white").style("border", "solid").style("border-width", "1px")
      .style("border-radius", "5px").style("padding", "10px").style("opacity", 0);

    //projection
    const asia_projection = d3.geoMercator().scale(600).center([140, 8]); //.center([x, y]); x = left is smaller / y = bottom is smaller

    // URL to the GeoJSON itself
    const pathGenerator = d3.geoPath().projection(asia_projection);
    const geoJsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

    const loadData = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        d3.json(geoJsonUrl).then((geojson: any) => {
          //Render a path for each GeoJSON feature
          const map_path = g.selectAll("path").data(geojson.features).enter().append("path").attr("d", (d: any) => pathGenerator(d) as string).attr("stroke", "grey").attr("fill", "white");

          g.selectAll("circle")
            .data(this.data_Covid)
            .enter()
            .append("circle")
            .attr("r", (d: any) => Math.max(Math.min(Math.sqrt(d.Total_Confirmed_Cases) / 50, 60), 5))
            .attr("r-original", (d: any) => Math.max(Math.min(Math.sqrt(d.Total_Confirmed_Cases) / 50, 60), 5))
            .attr("fill", (d: any) => this.getColor(d.Country_Region))
            .attr("opacity", 0.8)
            .attr("cx", (d: any) => {

              let filteredData: data_Other[] = this.data_Other;    
              filteredData = filteredData.filter(i => i.Country_Region === d.Country_Region);

              return filteredData[0]?.longitude && filteredData[0]?.latitude ? asia_projection([filteredData[0].longitude, filteredData[0].latitude])?.[0] ?? 0 : 0;
            })
            .attr("cy", (d: any) => {
              let filteredData: data_Other[] = this.data_Other;    
              filteredData = filteredData.filter(i => i.Country_Region === d.Country_Region);
              return filteredData[0]?.longitude && filteredData[0]?.latitude ? asia_projection([filteredData[0].longitude, filteredData[0].latitude])?.[1] ?? 0 : 0;
            })
            .on("mouseover", function(event: any, d: any) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 65);

              tooltip.style("opacity", 1)
                .html(`Country:${d.Country_Region}
                <br>Cases:${d.Total_Confirmed_Cases}
                <br>New Confirmed:${d.New_Confirmed_Cases}
                <br>New Fatalities:${d.New_Fatalities}
                <br>New Recovered:${d.New_Recovered_Cases}
                <br>Remaining Confirmed:${d.Remaining_Confirmed_Cases}`);
            })
            .on("mousemove", function(event: any) {
              tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(event: any, d: any) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("r", d3.select(this).attr("r-original"));

              tooltip.style("opacity", 0);
            });


          resolve();
        }).catch((error: any) => {
          reject(error);
        });
      });
    };

    loadData().then(() => {
      console.log("Map Data loaded successfully");
    }).catch((error) => {
      console.log("Error loading Map data", error);
    });

  }

  private sortBars(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, width: number, xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>,): void {
    const sortDescending = d3.select('#sort-checkbox').property('checked');
    const sortedData = this.data_Covid.sort((a, b) => sortDescending ? b.Total_Confirmed_Cases - a.Total_Confirmed_Cases : a.Total_Confirmed_Cases - b.Total_Confirmed_Cases);
  
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    x.domain(sortedData.map(d => d.Country_Region));
  
    const transition = svg.transition().duration(750);
  
    transition.selectAll('.bar')
    .attr('x', (d: any) => String(x(d.Country_Region)));  
    
    transition.select('.x.axis')
      .call((t) => d3.axisBottom(x)(t as any))
      .selectAll('g')
      .delay(25);

      xAxis.call(d3.axisBottom(x));
  } 

  private getColor(country: string): string {
    const colorMap: {[key: string]: string} = {
      'Brunei': 'pink',
      'Cambodia': 'purple',
      'Indonesia': 'red',
      'Malaysia': 'yellow',
      'Philippines': 'orange',
      'Singapore': 'blue',
      'Thailand': 'green',
      'Vietnam': 'brown',
    };
    return colorMap[country] || 'gray';
  }

}//end