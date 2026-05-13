'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ChevronRight, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TrendItem {
  id: string;
  title: string;
  summary?: string | null;
  sourceName: string;
  link: string;
  category: {
    id: string;
    displayName: string;
  };
}

interface ArticleWizardProps {
  trendItem: TrendItem;
}

interface Angle {
  description: string;
  title: string;
}

interface OutlineSection {
  heading: string;
  points: string[];
}

interface Outline {
  introduction: OutlineSection;
  sections: OutlineSection[];
  conclusion: OutlineSection;
}

export function ArticleWizard({ trendItem }: ArticleWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basics
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('educate');
  const [format, setFormat] = useState('standard_blog');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('English');
  const [useAida, setUseAida] = useState(false);

  // Step 2: Angles
  const [angles, setAngles] = useState<Angle[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAngle, setEditedAngle] = useState('');

  // Step 3: Outline
  const [outline, setOutline] = useState<Outline | null>(null);

  // Step 4: Draft
  const [draftContent, setDraftContent] = useState('');
  const [articleId, setArticleId] = useState('');

  const generateAngles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles/angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendItemId: trendItem.id,
          audience,
          goal,
          tone,
          format,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate angles');
      }

      const data = await response.json();
      setAngles(data.angles || []);
    } catch (error) {
      console.error('Error generating angles:', error);
      toast.error('Failed to generate article angles');
    } finally {
      setLoading(false);
    }
  };

  const generateOutline = async () => {
    if (!selectedAngle) return;

    setLoading(true);
    try {
      const response = await fetch('/api/articles/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendItemId: trendItem.id,
          angle: editedAngle || selectedAngle.description,
          title: editedTitle || selectedAngle.title,
          audience,
          goal,
          tone,
          format,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      setOutline(data.outline);
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Failed to generate article outline');
    } finally {
      setLoading(false);
    }
  };

  const regenerateOutline = async () => {
    if (!selectedAngle) return;

    setLoading(true);
    try {
      const response = await fetch('/api/articles/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendItemId: trendItem.id,
          angle: editedAngle || selectedAngle.description,
          title: editedTitle || selectedAngle.title,
          audience,
          goal,
          tone,
          format,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate outline');
      }

      const data = await response.json();
      setOutline(data.outline);
      toast.success('Outline regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating outline:', error);
      toast.error('Failed to regenerate article outline');
    } finally {
      setLoading(false);
    }
  };

  const generateDraft = async () => {
    if (!selectedAngle || !outline) return;

    setLoading(true);
    setDraftContent('');
    
    try {
      const response = await fetch('/api/articles/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendItemId: trendItem.id,
          angle: editedAngle || selectedAngle.description,
          title: editedTitle || selectedAngle.title,
          outline,
          audience,
          goal,
          tone,
          format,
          language,
          useAida
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let partialRead = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.status === 'generating' && parsed.content) {
                setDraftContent(prev => prev + parsed.content);
              } else if (parsed.status === 'completed' && parsed.articleId) {
                setArticleId(parsed.articleId);
                toast.success('Article draft generated successfully!');
                return;
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Generation failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      toast.error('Failed to generate article draft');
    } finally {
      setLoading(false);
    }
  };

  const regenerateDraft = async () => {
    if (!selectedAngle || !outline) return;

    setLoading(true);
    setDraftContent('');
    
    try {
      const response = await fetch('/api/articles/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendItemId: trendItem.id,
          angle: editedAngle || selectedAngle.description,
          title: editedTitle || selectedAngle.title,
          outline,
          audience,
          goal,
          tone,
          format,
          language,
          useAida
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate draft');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let partialRead = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.status === 'generating' && parsed.content) {
                setDraftContent(prev => prev + parsed.content);
              } else if (parsed.status === 'completed' && parsed.articleId) {
                setArticleId(parsed.articleId);
                toast.success('Article draft regenerated successfully!');
                return;
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Generation failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating draft:', error);
      toast.error('Failed to regenerate article draft');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      await generateAngles();
      setStep(2);
    } else if (step === 2) {
      if (!selectedAngle) {
        toast.error('Please select an angle');
        return;
      }
      await generateOutline();
      setStep(3);
    } else if (step === 3) {
      await generateDraft();
      setStep(4);
    }
  };

  const handleSelectAngle = (angle: Angle) => {
    setSelectedAngle(angle);
    setEditedTitle(angle.title);
    setEditedAngle(angle.description);
  };

  const handleEditOutlineSection = (type: 'introduction' | 'conclusion', field: 'heading' | 'points', value: any) => {
    if (!outline) return;
    setOutline({
      ...outline,
      [type]: {
        ...outline[type],
        [field]: value
      }
    });
  };

  const handleEditOutlineMainSection = (index: number, field: 'heading' | 'points', value: any) => {
    if (!outline) return;
    const newSections = [...outline.sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    setOutline({
      ...outline,
      sections: newSections
    });
  };

  const addOutlineSection = () => {
    if (!outline) return;
    setOutline({
      ...outline,
      sections: [
        ...outline.sections,
        { heading: 'New Section', points: ['Point 1', 'Point 2', 'Point 3'] }
      ]
    });
  };

  const removeOutlineSection = (index: number) => {
    if (!outline) return;
    const newSections = outline.sections.filter((_, i) => i !== index);
    setOutline({
      ...outline,
      sections: newSections
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {['Basics', 'Angle', 'Outline', 'Draft'].map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step > index + 1
                  ? 'bg-primary border-primary text-primary-foreground'
                  : step === index + 1
                  ? 'border-primary text-primary'
                  : 'border-zinc-700 text-zinc-600'
              }`}
            >
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              step >= index + 1 ? 'text-zinc-200' : 'text-zinc-600'
            }`}>
              {label}
            </span>
            {index < 3 && (
              <ChevronRight className="mx-4 h-5 w-5 text-zinc-700" />
            )}
          </div>
        ))}
      </div>

      {/* Source trend item info */}
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Source Trend Item</h3>
        <h4 className="text-base font-medium text-zinc-200 mb-1">{trendItem.title}</h4>
        <p className="text-sm text-zinc-500 mb-2">{trendItem.summary}</p>
        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <span>Source: {trendItem.sourceName}</span>
          <span>Category: {trendItem.category.displayName}</span>
        </div>
      </Card>

      {/* Step 1: Basics */}
      {step === 1 && (
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-100 mb-6">Article Basics</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Tech-savvy professionals, Business leaders"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="goal">Article Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educate">Educate</SelectItem>
                  <SelectItem value="thought_leadership">Thought Leadership</SelectItem>
                  <SelectItem value="how_to">How-to Guide</SelectItem>
                  <SelectItem value="news_analysis">News Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Article Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_blog">Short Blog (600-800 words)</SelectItem>
                  <SelectItem value="standard_blog">Standard Blog (1000-1500 words)</SelectItem>
                  <SelectItem value="deep_dive">Deep Dive (2000+ words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="bold">Bold/Opinionated</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-950/50">
              <div className="flex-1">
                <Label htmlFor="aida" className="text-base font-semibold text-zinc-100">
                  Use AIDA Framework
                </Label>
                <p className="text-sm text-zinc-500 mt-1">
                  Apply Attention, Interest, Desire, Action structure to drive reader engagement and conversions
                </p>
              </div>
              <Switch
                id="aida"
                checked={useAida}
                onCheckedChange={setUseAida}
                className="ml-4"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Angles...
                </>
              ) : (
                <>
                  Next: Generate Angles
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Angle & Title */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100">Select Article Angle</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAngles}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>

          <div className="grid gap-4">
            {angles.map((angle, index) => (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all ${
                  selectedAngle === angle
                    ? 'bg-primary/10 border-primary'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
                onClick={() => handleSelectAngle(angle)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex-shrink-0 ${
                    selectedAngle === angle
                      ? 'border-primary bg-primary'
                      : 'border-zinc-700'
                  }`}>
                    {selectedAngle === angle && (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-zinc-200 mb-2">
                      {angle.title}
                    </h3>
                    <p className="text-sm text-zinc-400">{angle.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedAngle && (
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 mt-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">Edit Selected Angle</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editedTitle">Article Title</Label>
                  <Input
                    id="editedTitle"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="editedAngle">Angle Description</Label>
                  <Textarea
                    id="editedAngle"
                    value={editedAngle}
                    onChange={(e) => setEditedAngle(e.target.value)}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading || !selectedAngle}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Outline...
                </>
              ) : (
                <>
                  Next: Generate Outline
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Outline */}
      {step === 3 && outline && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100">Edit Outline</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateOutline}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>

          {/* Introduction */}
          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <Input
              value={outline.introduction.heading}
              onChange={(e) => handleEditOutlineSection('introduction', 'heading', e.target.value)}
              className="mb-3 font-semibold"
            />
            {outline.introduction.points.map((point, index) => (
              <Input
                key={index}
                value={point}
                onChange={(e) => {
                  const newPoints = [...outline.introduction.points];
                  newPoints[index] = e.target.value;
                  handleEditOutlineSection('introduction', 'points', newPoints);
                }}
                className="mb-2"
              />
            ))}
          </Card>

          {/* Main sections */}
          {outline.sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={section.heading}
                  onChange={(e) => handleEditOutlineMainSection(sectionIndex, 'heading', e.target.value)}
                  className="font-semibold flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOutlineSection(sectionIndex)}
                >
                  Remove
                </Button>
              </div>
              {section.points.map((point, pointIndex) => (
                <Input
                  key={pointIndex}
                  value={point}
                  onChange={(e) => {
                    const newPoints = [...section.points];
                    newPoints[pointIndex] = e.target.value;
                    handleEditOutlineMainSection(sectionIndex, 'points', newPoints);
                  }}
                  className="mb-2"
                />
              ))}
            </Card>
          ))}

          <Button variant="outline" onClick={addOutlineSection} className="w-full">
            + Add Section
          </Button>

          {/* Conclusion */}
          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <Input
              value={outline.conclusion.heading}
              onChange={(e) => handleEditOutlineSection('conclusion', 'heading', e.target.value)}
              className="mb-3 font-semibold"
            />
            {outline.conclusion.points.map((point, index) => (
              <Input
                key={index}
                value={point}
                onChange={(e) => {
                  const newPoints = [...outline.conclusion.points];
                  newPoints[index] = e.target.value;
                  handleEditOutlineSection('conclusion', 'points', newPoints);
                }}
                className="mb-2"
              />
            ))}
          </Card>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Draft
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Draft */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100">Article Draft</h2>
            {articleId && (
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateDraft}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            )}
          </div>
          
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <h1 className="text-2xl font-bold text-zinc-100 mb-6">
              {editedTitle || selectedAngle?.title}
            </h1>
            <div className="prose prose-invert max-w-none">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-zinc-300">{draftContent}</div>
              )}
            </div>
          </Card>

          {articleId && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => router.push('/dashboard/articles')}>
                View All Articles
              </Button>
              <Button onClick={() => router.push(`/dashboard/articles/${articleId}`)}>
                Edit Article
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}