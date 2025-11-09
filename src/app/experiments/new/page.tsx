"use client";

import { NewExperimentForm } from "@/components/experiments/NewExperimentForm";

export default function NewExperiment(){
  return (
    <main className="container-page">
      <div className="max-w-3xl mx-auto card p-5">
        <NewExperimentForm />
      </div>
    </main>
  );
}
