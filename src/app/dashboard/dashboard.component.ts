import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  data: any[] = [];
  filteredData: MatTableDataSource<any>;
  uniqueMakes: string[] = [];
  selectedMake: string = '';
  displayedColumns: string[] = ['Make', 'Model', 'Year', 'Electric Range'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Proportion of Vehicles by Make',
        align: 'start', 
        font: {
          size: 16, 
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
  };
  

  pieChartLabels: string[] = [];
  pieChartData: ChartDataset<'pie'>[] = [];
  chartLabels: string[] = [];
  chartData: ChartDataset<'bar'>[] = [];
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Vehicle Counts by Make' },
    },
  };
  
  constructor(private http: HttpClient) {
    this.filteredData = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.http
  .get('assets/Electric_Vehicle_Population_Data.csv', { responseType: 'text' })
  .subscribe({
    next: (csvData) => {
      this.data = this.parseCSV(csvData);
      this.filteredData = new MatTableDataSource(this.data);
      this.filteredData.paginator = this.paginator;
      this.uniqueMakes = [...new Set(this.data.map((item) => item.Make))];
      this.prepareCharts();
    },
    error: (err) => {
      console.error('Failed to load CSV data', err);
    },
  });

  }

  ngAfterViewInit(): void {
    this.filteredData.paginator = this.paginator;
  }

  parseCSV(csvData: string): any[] {
    const lines = csvData.split('\n').filter((line) => line.trim());
    const headers = lines[0]?.split(',').map((header) => header.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      if (currentLine.length === headers.length) {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = currentLine[index]?.trim();
        });
        result.push(obj);
      }
    }
    return result;
  }
  

  prepareCharts(): void {
    const makeCounts = this.filteredData.data.reduce(
      (acc: { [key: string]: number }, item: any) => {
        acc[item.Make] = (acc[item.Make] || 0) + 1;
        return acc;
      },
      {}
    );
  
    // Bar Chart Data
    this.chartLabels = Object.keys(makeCounts);
    this.chartData = [
      {
        label: 'Vehicle Counts',
        data: Object.values(makeCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ];
  
    // Pie Chart Data
    this.pieChartLabels = Object.keys(makeCounts);
    this.pieChartData = [
      {
        data: Object.values(makeCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ];
  }
  

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredData.filter = filterValue;
    if (this.filteredData.paginator) {
      this.filteredData.paginator.firstPage();
    }
    this.prepareCharts();
  }

  filterData(): void {
    const filtered = this.selectedMake
      ? this.data.filter((item) => item.Make === this.selectedMake)
      : this.data;
    this.filteredData = new MatTableDataSource(filtered);
    this.filteredData.paginator = this.paginator;
    this.prepareCharts();
  }
}
