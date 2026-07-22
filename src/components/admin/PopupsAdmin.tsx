import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Edit2, Plus } from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';

type Popup = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  frequency_days: number;
  pages: string[];
  bg_color: string;
  text_color: string;
  accent_color: string;
  animation_type: string;
  position: string;
};

type PopupForm = Omit<Popup, 'id'> & { id?: string };

const DEFAULT_POPUP: PopupForm = {
  title: '',
  description: '',
  image_url: null,
  cta_text: '',
  cta_url: '',
  is_active: true,
  frequency_days: 7,
  pages: ['all'],
  bg_color: '#FFFFFF',
  text_color: '#000000',
  accent_color: '#FFD700',
  animation_type: 'fade',
  position: 'center',
};

const PopupsAdmin = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [popupForm, setPopupForm] = useState<PopupForm>(DEFAULT_POPUP);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load popups
  const loadPopups = async () => {
    setLoading(true);
    const { data } = await supabase.from('popups').select('*');
    if (data) {
      const popupsList = data.map(p => ({
        ...p,
        pages: Array.isArray(p.pages) ? p.pages : (typeof p.pages === 'string' ? JSON.parse(p.pages) : ['all']),
      })) as Popup[];
      setPopups(popupsList);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPopups();
  }, []);

  // Save or update popup
  const savePopup = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: popupForm.title,
      description: popupForm.description || null,
      image_url: popupForm.image_url || null,
      cta_text: popupForm.cta_text || null,
      cta_url: popupForm.cta_url || null,
      is_active: popupForm.is_active,
      frequency_days: popupForm.frequency_days,
      pages: popupForm.pages,
      bg_color: popupForm.bg_color,
      text_color: popupForm.text_color,
      accent_color: popupForm.accent_color,
      animation_type: popupForm.animation_type,
      position: popupForm.position,
    };

    if (editingId) {
      // Update
      const { error } = await supabase.from('popups').update(payload).eq('id', editingId);
      if (error) console.error('Update error:', error);
    } else {
      // Create
      const { error } = await supabase.from('popups').insert([payload]);
      if (error) console.error('Insert error:', error);
    }

    setPopupForm(DEFAULT_POPUP);
    setEditingId(null);
    loadPopups();
  };

  // Edit popup
  const editPopup = (popup: Popup) => {
    setPopupForm(popup);
    setEditingId(popup.id);
  };

  // Delete popup
  const deletePopup = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pop-up ?')) {
      const { error } = await supabase.from('popups').delete().eq('id', id);
      if (error) console.error('Delete error:', error);
      loadPopups();
    }
  };

  // Reset form
  const resetForm = () => {
    setPopupForm(DEFAULT_POPUP);
    setEditingId(null);
  };

  const togglePage = (page: string) => {
    const newPages = popupForm.pages.includes(page)
      ? popupForm.pages.filter(p => p !== page)
      : [...popupForm.pages, page];
    setPopupForm({ ...popupForm, pages: newPages });
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle>{editingId ? 'Modifier le pop-up' : 'Créer un nouveau pop-up'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePopup} className="space-y-6">
            {/* Title */}
            <div>
              <Label>Titre *</Label>
              <Input
                value={popupForm.title}
                onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                placeholder="Titre du pop-up"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={popupForm.description || ''}
                onChange={(e) => setPopupForm({ ...popupForm, description: e.target.value })}
                placeholder="Description optionnelle du pop-up"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Image (optionnel)</Label>
              <MediaUpload
                onUpload={(url) => setPopupForm({ ...popupForm, image_url: url })}
                currentUrl={popupForm.image_url || undefined}
              />
            </div>

            {/* CTA */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Texte du bouton CTA</Label>
                <Input
                  value={popupForm.cta_text || ''}
                  onChange={(e) => setPopupForm({ ...popupForm, cta_text: e.target.value })}
                  placeholder="ex: En savoir plus"
                />
              </div>
              <div>
                <Label>URL du CTA</Label>
                <Input
                  value={popupForm.cta_url || ''}
                  onChange={(e) => setPopupForm({ ...popupForm, cta_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <Label>Fréquence d'apparition (jours)</Label>
              <Input
                type="number"
                min={0}
                value={popupForm.frequency_days}
                onChange={(e) => setPopupForm({ ...popupForm, frequency_days: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = montrer à chaque visite, n = montrer une fois tous les n jours
              </p>
            </div>

            {/* Pages Selection */}
            <div>
              <Label>Pages d'apparition</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {['all', 'home', 'about', 'community', 'teachings', 'donate'].map(page => (
                  <label key={page} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={popupForm.pages.includes(page)}
                      onChange={() => togglePage(page)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{page === 'all' ? 'Toutes les pages' : page}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Couleur de fond</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={popupForm.bg_color}
                    onChange={(e) => setPopupForm({ ...popupForm, bg_color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input value={popupForm.bg_color} readOnly className="text-xs" />
                </div>
              </div>
              <div>
                <Label>Couleur du texte</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={popupForm.text_color}
                    onChange={(e) => setPopupForm({ ...popupForm, text_color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input value={popupForm.text_color} readOnly className="text-xs" />
                </div>
              </div>
              <div>
                <Label>Couleur d'accent</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={popupForm.accent_color}
                    onChange={(e) => setPopupForm({ ...popupForm, accent_color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input value={popupForm.accent_color} readOnly className="text-xs" />
                </div>
              </div>
            </div>

            {/* Animation & Position */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Type d'animation</Label>
                <select
                  value={popupForm.animation_type}
                  onChange={(e) => setPopupForm({ ...popupForm, animation_type: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="fade">Fondu (fade)</option>
                  <option value="slideDown">Coulisse de haut</option>
                  <option value="zoom">Zoom</option>
                  <option value="bounce">Rebond</option>
                </select>
              </div>
              <div>
                <Label>Position</Label>
                <select
                  value={popupForm.position}
                  onChange={(e) => setPopupForm({ ...popupForm, position: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="center">Centre (modal)</option>
                  <option value="topLeft">Haut-gauche</option>
                  <option value="topRight">Haut-droite</option>
                  <option value="bottomLeft">Bas-gauche</option>
                  <option value="bottomRight">Bas-droite</option>
                </select>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={popupForm.is_active}
                onChange={(e) => setPopupForm({ ...popupForm, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Activé</Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gold hover:bg-gold/80 text-black">
                {editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
              {editingId && (
                <Button type="button" onClick={resetForm} variant="outline">
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Popup List */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle>Pop-ups existants ({popups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {popups.length === 0 ? (
            <p className="text-muted-foreground">Aucun pop-up créé pour le moment.</p>
          ) : (
            <div className="grid gap-4">
              {popups.map(popup => (
                <div
                  key={popup.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  style={{ borderLeftColor: popup.accent_color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{popup.title}</h3>
                      {popup.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{popup.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded ${popup.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {popup.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {popup.frequency_days === 0 ? 'Chaque visite' : `Tous les ${popup.frequency_days}j`}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                          {popup.pages.includes('all') ? 'Toutes' : popup.pages.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => editPopup(popup)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        onClick={() => deletePopup(popup.id)}
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PopupsAdmin;
