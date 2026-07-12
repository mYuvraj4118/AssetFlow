import React from 'react';
import { CheckSquare, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import AuditStatusBadge from './AuditStatusBadge';
import { Button } from '../../common';

const AuditTable = ({ assets, onVerify }) => {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="org-table-responsive-wrapper">
      <table className="org-table audit-table">
        <thead>
          <tr>
            <th>Asset Tag</th>
            <th>Asset Name</th>
            <th>Expected Location</th>
            <th>Current Holder</th>
            <th>Verification Status</th>
            <th>Last Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.assetTag} className="audit-row">
              <td data-label="Asset Tag" className="font-mono font-bold text-heading">
                {asset.assetTag}
              </td>
              <td data-label="Asset Name" className="font-semibold text-heading">
                {asset.assetName}
              </td>
              <td data-label="Expected Location">
                {asset.expectedLocation}
              </td>
              <td data-label="Current Holder">
                {asset.currentHolder}
              </td>
              <td data-label="Status">
                <AuditStatusBadge status={asset.verificationStatus} />
              </td>
              <td data-label="Last Verified">
                {asset.lastVerified || 'Pending'}
              </td>
              <td data-label="Actions">
                <div className="action-buttons-cell justify-end md:justify-start">
                  <Button
                    variant={asset.verificationStatus === 'Pending' ? 'primary' : 'flat'}
                    size="sm"
                    onClick={() => onVerify(asset)}
                    icon={<CheckSquare size={13} />}
                    aria-label={`Verify status for ${asset.assetName}`}
                  >
                    Verify
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
