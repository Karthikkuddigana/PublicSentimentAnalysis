# app/services/benchmark_service.py

import time

class BenchmarkTimer:

    def __init__(self):
        self.start_time = time.time()
        self.marks = {}

    def mark(self, label: str):
        self.marks[label] = round(time.time() - self.start_time, 4)

    def report(self):
        self.marks["total_time"] = round(time.time() - self.start_time, 4)
        return self.marks