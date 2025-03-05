interface Medicine {
  id: number;
  name: string;
  dosage: string;
  schedule: string;
  status: string;
}

declare global {
  var medicineList: Medicine[];
}

export {};
