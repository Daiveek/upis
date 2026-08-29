alter table documents add column if not exists status text not null default 'available';
alter table documents add column if not exists filename text;
alter table verification_events add column if not exists status text not null default 'complete';
create index if not exists property_passports_passport_id_idx on property_passports(passport_id);
create index if not exists properties_passport_id_idx on properties(passport_id);
create index if not exists property_applications_application_id_idx on property_applications(application_id);
create index if not exists verification_events_application_id_idx on verification_events(application_id);
create index if not exists documents_property_id_idx on documents(property_id);
