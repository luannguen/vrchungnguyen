
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { contactService, Contact } from "@/services/contactService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Eye, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ContactsPage() {
    const { t } = useTranslation();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data } = await contactService.getContacts({ search: searchTerm });
            setContacts(data || []);
        } catch (error) {
            console.error("Failed to fetch contacts", error);
            toast.error(t('load_contacts_fail'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchContacts();
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleViewDetail = async (contact: Contact) => {
        setSelectedContact(contact);
        setIsDetailOpen(true);

        // Mark as read if currently new
        if (contact.status === 'new') {
            try {
                await contactService.updateContactStatus(contact.id, 'read');
                // Update local state
                setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: 'read' } : c));
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: Contact['status']) => {
        try {
            await contactService.updateContactStatus(id, newStatus);
            setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
            if (selectedContact && selectedContact.id === id) {
                setSelectedContact({ ...selectedContact, status: newStatus });
            }
            toast.success(t('status_updated', { status: newStatus }));
        } catch (error) {
            toast.error(t('update_status_fail'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete_contact'))) return;
        try {
            await contactService.deleteContact(id);
            setContacts(prev => prev.filter(c => c.id !== id));
            setIsDetailOpen(false);
            toast.success(t('delete_contact_success'));
        } catch (error) {
            toast.error(t('delete_contact_fail'));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge className="bg-blue-500 hover:bg-blue-600">{t('status_new')}</Badge>;
            case 'read': return <Badge variant="secondary">{t('status_read')}</Badge>;
            case 'replied': return <Badge className="bg-green-500 hover:bg-green-600">{t('status_replied')}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('contact_messages')}</h1>
                    <p className="text-muted-foreground">{t('contact_messages_subtitle')}</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search_contacts_placeholder')}
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('date_header')}</TableHead>
                            <TableHead>{t('name_header')}</TableHead>
                            <TableHead>{t('subject_header')}</TableHead>
                            <TableHead>{t('status_header')}</TableHead>
                            <TableHead className="text-right">{t('actions_header')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
                                </TableCell>
                            </TableRow>
                        ) : contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {t('no_messages')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact) => (
                                <TableRow key={contact.id} className={contact.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-900/10 font-medium' : ''}>
                                    <TableCell>
                                        {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{contact.name}</span>
                                            <span className="text-xs text-muted-foreground">{contact.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={contact.subject}>
                                        {contact.subject || '(No Subject)'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(contact)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('message_detail')}</DialogTitle>
                        <DialogDescription>
                            {t('received_on')} {selectedContact && format(new Date(selectedContact.created_at), 'PPpp')}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-muted-foreground block">{t('from_label')}</span>
                                    {selectedContact.name}
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground block">{t('email_label')}</span>
                                    <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">{selectedContact.email}</a>
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground block">{t('phone_label')}</span>
                                    {selectedContact.phone || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground block">{t('current_status_label')}</span>
                                    {getStatusBadge(selectedContact.status)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="font-semibold text-muted-foreground block text-sm">{t('subject_label')}</span>
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border font-medium">
                                    {selectedContact.subject}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="font-semibold text-muted-foreground block text-sm">{t('message_label')}</span>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm whitespace-pre-wrap h-[150px] overflow-y-auto">
                                    {selectedContact.message}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-between flex-row gap-2">
                        <Button variant="destructive" size="sm" onClick={() => selectedContact && handleDelete(selectedContact.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> {t('delete')}
                        </Button>
                        <div className="flex gap-2">
                            {selectedContact?.status !== 'replied' && (
                                <Button size="sm" onClick={() => selectedContact && handleUpdateStatus(selectedContact.id, 'replied')} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" /> {t('mark_replied')}
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                                {t('close')}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
