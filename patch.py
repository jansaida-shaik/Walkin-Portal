import re

with open('apps/frontend/src/components/StudentContextDrawer.tsx', 'r') as f:
    content = f.read()

target = """                  <span className="drawer-section-label">Contact Details</span>
                  <div className="drawer-info-grid">
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Phone</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>{student.phone || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Email</span>
                      <span className="drawer-info-value">{student.email || student.details?.email || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Parent Phone</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.details?.parent_phone || student.details?.['Parent Number'] || '—'}
                      </span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Lead Source</span>
                      <span className="drawer-info-value">{student.source || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Walk-in Date</span>
                      <span className="drawer-info-value">{formatDate(student.walkinDate)}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Branch</span>
                      <span className="drawer-info-value">{student.branchName || '—'}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <span className="drawer-section-label">Academic Profile</span>
                    <div className="drawer-info-grid">
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Qualification</span>
                        <span className="drawer-info-value">
                          {student.details?.qualification || student.details?.['Educational Qualification'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">College</span>
                        <span className="drawer-info-value">
                          {student.details?.college_name || student.details?.['Institution Name'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Passout Year</span>
                        <span className="drawer-info-value">
                          {student.details?.passout_year || student.details?.['Year of Passout'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Gender</span>
                        <span className="drawer-info-value">
                          {student.details?.gender || student.details?.['Gender'] || '—'}
                        </span>
                      </div>
                    </div>
                  </div>"""

replacement = """                  <span className="drawer-section-label">Contact Details</span>
                  <div className="drawer-info-grid">
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Phone</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>{student.phone || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Email</span>
                      <span className="drawer-info-value">{student.email || student.details?.email || student.details?.['Email Address'] || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Parent Phone</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.details?.parent_phone || student.details?.['Parent Number'] || '—'}
                      </span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Date of Birth</span>
                      <span className="drawer-info-value">{student.details?.dob || student.details?.['Date of Birth'] || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Lead Source</span>
                      <span className="drawer-info-value">{student.source || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Walk-in Date</span>
                      <span className="drawer-info-value">{formatDate(student.walkinDate)}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Branch</span>
                      <span className="drawer-info-value">{student.branchName || '—'}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <span className="drawer-section-label">Academic Profile</span>
                    <div className="drawer-info-grid">
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Qualification</span>
                        <span className="drawer-info-value">
                          {student.details?.qualification || student.details?.['Educational Qualification'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">College</span>
                        <span className="drawer-info-value">
                          {student.details?.college_name || student.details?.['Institution Name'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Passout Year</span>
                        <span className="drawer-info-value">
                          {student.details?.passout_year || student.details?.['Year of Passout'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Gender</span>
                        <span className="drawer-info-value">
                          {student.details?.gender || student.details?.['Gender'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">10th %</span>
                        <span className="drawer-info-value">{student.details?.ssc_percentage || student.details?.['10th %'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Intermediate %</span>
                        <span className="drawer-info-value">{student.details?.inter_percentage || student.details?.['Intermediate %'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Degree %</span>
                        <span className="drawer-info-value">{student.details?.degree_percentage || student.details?.['B.Tech/Degree %'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">PG %</span>
                        <span className="drawer-info-value">{student.details?.pg_percentage || student.details?.['Post Graduation %'] || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <span className="drawer-section-label">Training & Course</span>
                    <div className="drawer-info-grid">
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Course</span>
                        <span className="drawer-info-value">{student.course || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Mode of Training</span>
                        <span className="drawer-info-value">{student.details?.training_mode || student.details?.['Mode of Training'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Why this Course</span>
                        <span className="drawer-info-value">{student.details?.reason_for_course || student.details?.['Why do you want this Course?'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Course Fee (₹)</span>
                        <span className="drawer-info-value">{student.details?.course_fee || student.details?.['Course Fee'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Discount (%)</span>
                        <span className="drawer-info-value">{student.details?.discount || student.details?.['Discount'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Final Fee (₹)</span>
                        <span className="drawer-info-value">{student.details?.final_course_fee || student.details?.['Final Course Fee'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Duration (Days)</span>
                        <span className="drawer-info-value">{student.details?.duration || student.details?.['Duration (In Days)'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Previous Institute</span>
                        <span className="drawer-info-value">{student.details?.prev_institute || student.details?.['Previous Training Institute'] || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <span className="drawer-section-label">Intake & Registration</span>
                    <div className="drawer-info-grid">
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Location</span>
                        <span className="drawer-info-value">{student.details?.location || student.details?.['Location'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Form No</span>
                        <span className="drawer-info-value">{student.details?.form_no || student.details?.['Form No'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Time</span>
                        <span className="drawer-info-value">{student.details?.walkin_time || student.details?.['Time'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Referrer</span>
                        <span className="drawer-info-value">{student.details?.referrer_name || student.details?.['Referrer Name'] || '—'}</span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">How Did You Know Us</span>
                        <span className="drawer-info-value">{student.details?.know_about_us || student.details?.['How Did You Know About Us'] || '—'}</span>
                      </div>
                    </div>
                  </div>"""

if target in content:
    with open('apps/frontend/src/components/StudentContextDrawer.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Success")
else:
    print("Target not found")
