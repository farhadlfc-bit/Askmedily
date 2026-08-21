import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const conditionName = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${conditionName} — Medications & Information | AskMedily`,
    description: `What medications are prescribed for ${conditionName}? Symptoms, treatments and lifestyle tips explained in plain English. NHS sourced.`,
    openGraph: {
      title: `${conditionName} | AskMedily`,
      description: `Plain English guide to ${conditionName} — medications, symptoms and treatments.`,
    }
  };
}

export default async function ConditionSlugPage({ params }: Props) {
  const { slug } = await params;
  const conditionName = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  redirect(`/condition?q=${encodeURIComponent(conditionName)}`);
}
