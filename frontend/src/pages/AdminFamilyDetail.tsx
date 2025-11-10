import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Baby, Calendar, FileText, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface FamilyDetail {
  id: string;
  familyName: string;
  familyCode: string;
  parent1: any;
  parent2: any;
  children: any[];
  custodyArrangement: string;
  custodyAgreement: any;
  createdAt: string;
  linkedAt: string | null;
}

const AdminFamilyDetail: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (familyId) {
      fetchFamilyDetails();
    }
  }, [familyId]);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getFamilyDetails(familyId!);
      setFamily(data);
    } catch (error) {
      console.error('Error fetching family details:', error);
      toast({
        title: "Error",
        description: "Failed to load family details",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family details...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Family not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{family.familyName}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-600">Family Code:</span>
                <span className="font-mono font-semibold text-blue-600 text-lg">{family.familyCode}</span>
                {family.parent2 ? (
                  <Badge className="bg-green-100 text-green-800">Fully Linked</Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Awaiting Parent 2
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Parent 1 Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Parent 1
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {family.parent1 ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{family.parent1.firstName} {family.parent1.lastName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm">{family.parent1.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm">Joined: {new Date(family.createdAt).toLocaleDateString()}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">No information available</p>
              )}
            </CardContent>
          </Card>

          {/* Parent 2 Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Parent 2
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {family.parent2 ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{family.parent2.firstName} {family.parent2.lastName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm">{family.parent2.email}</p>
                  </div>
                  {family.linkedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm">Linked: {new Date(family.linkedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <UserX className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 italic">Not linked yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Waiting for Parent 2 to join using code: <span className="font-mono font-semibold">{family.familyCode}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Children Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-600" />
              Children ({family.children.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {family.children.length === 0 ? (
              <div className="text-center py-8">
                <Baby className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No children added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {family.children.map((child, index) => (
                  <div key={child.id || index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {child.name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{child.name}</h4>
                        <p className="text-sm text-gray-600">
                          DOB: {new Date(child.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {child.school && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>School:</strong> {child.school}
                      </p>
                    )}
                    {child.grade && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Grade:</strong> {child.grade}
                      </p>
                    )}
                    {child.allergies && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Allergies:</strong> {child.allergies}
                      </p>
                    )}
                    {child.medications && (
                      <p className="text-sm text-gray-600">
                        <strong>Medications:</strong> {child.medications}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custody Arrangement Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Custody Arrangement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Arrangement Type</p>
                <p className="font-semibold">{family.custodyArrangement || 'Not specified'}</p>
              </div>
              
              {family.custodyAgreement ? (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Custody Agreement Details</p>
                  {family.custodyAgreement.fileName && (
                    <p className="text-sm text-gray-600">File: {family.custodyAgreement.fileName}</p>
                  )}
                  {family.custodyAgreement.uploadDate && (
                    <p className="text-sm text-gray-600">
                      Uploaded: {new Date(family.custodyAgreement.uploadDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mt-2">No custody agreement uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const UserX = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
  </svg>
);

export default AdminFamilyDetail;

