-- Seed data (2026 lineup and sponsors; 2027 settings). Review before production.
begin;
insert into public.admins (email, role) values ('jill@highwater.cafe','owner');
insert into public.settings (id, event_year, hero_para1, hero_para2) values (1, 2027, '**30+ world-class carvers** from across the U.S., Canada, the U.K. and beyond turn raw Oregon timber into art — live, on Reedsport''s waterfront.', '**Now in its 27th year,** the Oregon Divisional Chainsaw Carving Championship fills four days with live demonstrations, daily Quick Carve contests and auctions, food, vendors and more.');

-- Carvers (2026 field). photo_path points at /public/images/carvers seed photos.
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('adrian-bois','Adrian Bois','Argentina','Argentina','Pro','Award-winning carver with international experience',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('alex-pricob','Alex Pricob','Renton, WA','USA','Pro','Full-time carver since 2014, originally from Moldova',null,'/images/carvers/alex-pricob.jpg','Sculpture by Alex Pricob');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('andy-walser','Andy Walser','Puyallup, WA','USA','Pro','Traditional artist; promoted from Semi-Pro in 2025',null,'/images/carvers/andy-walser.jpg','Sculpture by Andy Walser');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('anthony-robinson','Anthony Robinson','Hoquiam, WA','USA','Pro','Carving since 2012; returning since 2021',null,'/images/carvers/anthony-robinson.jpg','Sculpture by Anthony Robinson');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('bill-baker','Bill Baker','Naperville, IL','USA','Pro','Top Notch founder; 27+ years as a pro',null,'/images/carvers/bill-baker.jpg','Carved Sasquatch reading to a child');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('bob-king','Bob King','Edgewood, WA','USA','Pro','Carving since 1998','Co-founder','/images/carvers/bob-king.jpg','Carved owls perched in a bare tree');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('brian-vorwaller','Brian Vorwaller','Bandon, OR','USA','Pro','Nearly two decades carving NW wildlife',null,'/images/carvers/brian-vorwaller.jpg','Sculpture by Brian Vorwaller');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('chad-kilpatrick','Chad Kilpatrick','Bloomburg, TX','USA','Pro','8 years carving; multi-state competitor',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('chris-foltz','Chris Foltz','North Bend, OR','USA','Pro','World champion ice sculptor; OCCI instructor',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('colby-herrington','Colby Herrington','Bonney Lake, WA','USA','Pro','Started carving at age 12','2025 Champion','/images/carvers/colby-herrington.jpg','Carved deer and fawns rising from a stump');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('constantin-morari','Constantin Morari','Sacramento, CA','USA','Pro','Art-school trained; 10th year at ODCCC',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('denny-henson','Denny Henson','Sandpoint, ID','USA','Pro','Retired engineer; full-time since 2023',null,'/images/carvers/denny-henson.jpg','Sculpture by Denny Henson');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('derek-richardson','Derek Richardson','Brandenburg, KY','USA','Pro','Known for firefighter-themed work',null,'/images/carvers/derek-richardson.jpg','Sculpture by Derek Richardson');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('derrick-stanton','Derrick Stanton','Sheridan, OR','USA','Pro','Timber Town Carvings; 15+ years full-time',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('gregory-hood','Gregory Hood','Kokomo, IN','USA','Pro','5 years carving; 9th place in 2025',null,'/images/carvers/gregory-hood.jpg','Sculpture by Gregory Hood');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('ian-rakestraw','Ian Rakestraw','Olympia, WA','USA','Pro','Carving since 2019; 5-time competitor',null,'/images/carvers/ian-rakestraw.jpg','Sculpture by Ian Rakestraw');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('jacob-lucas','Jacob Lucas','Bonney Lake, WA','USA','Pro','Detailed custom work',null,'/images/carvers/jacob-lucas.jpg','Carved face of a fern goddess');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('jake-hudson','Jake Hudson','Petaluma, CA','USA','Pro','Metal fabricator turned figurative carver',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('jason-alger','Jason Alger','Jenison, MI','USA','Pro','Artistic Timber; back after an 11-year break',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('jason-murieen','Jason Murieen','Grenada, CA','USA','Pro','USFS Regional Saw Coordinator',null,'/images/carvers/jason-murieen.jpg','Sculpture by Jason Murieen');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('jeff-coss','Jeff Coss','Cumberland, IA','USA','Pro','Bear Grove; wildlife and Sasquatch specialist',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('mark-colp','Mark Colp','Lakeport, CA','USA','Pro','Wooden Creations; charter ODCCC carver',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('nate-hall','Nate Hall','Lincoln, NE','USA','Pro','3 Timber Studio; pro since 2017',null,'/images/carvers/nate-hall.jpg','Sculpture by Nate Hall');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('nick-bielby','Nick Bielby','Port Angeles, WA','USA','Pro','Longtime Pacific Northwest regular',null,'/images/carvers/nick-bielby.jpg','Sculpture by Nick Bielby');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('patrick-barrigar','Patrick Barrigar','Paradise, MI','USA','Pro','Bear Grrr founder',null,'/images/carvers/patrick-barrigar.jpg','Sculpture by Patrick Barrigar');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('rachael-mirth','Rachael Mirth','Kansas City, KS','USA','Pro','Mirthful Creations; aquatic specialist',null,'/images/carvers/rachael-mirth.jpg','Carved red sockeye salmon');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('ryan-anderson','Ryan Anderson','Coos Bay, OR','USA','Pro','Sculptures In Motion; 200+ competitions',null,'/images/carvers/ryan-anderson.jpg','Carved sea turtles and clam shell');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('shane-green','Shane Green','United Kingdom','United Kingdom','Pro','Yorkshire Carver; UK & European champion','International','/images/carvers/shane-green.jpg','Scorched-wood wolf carving');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('steven-higgins','Steven Higgins','Kansas City, MO','USA','Pro','Original ODCCC participant; 25+ years',null,'/images/carvers/steven-higgins.jpg','Sculpture by Steven Higgins');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('tyler-welfing','Tyler Welfing','Vernon, BC, Canada','Canada','Pro','CarveWel Creations; cabinetry background','International','/images/carvers/tyler-welfing.jpg','Sculpture by Tyler Welfing');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('adonijah-stanton','Adonijah Stanton','Monmouth, OR','USA','Semi-Pro','Wildlife and expressive work',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('brittny-hughes','Brittny Hughes','Creswell, OR','USA','Semi-Pro','Sixth straight year at ODCCC',null,'/images/carvers/brittny-hughes.jpg','Sculpture by Brittny Hughes');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('dylan-ezell','Dylan Ezell','Jenison, MI','USA','Semi-Pro','Carving since 2022; 30+ states traveled',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('katrina-dressler','Katrina Dressler','Willington, CT','USA','Semi-Pro','Navy veteran; colorful bear carvings',null,'/images/carvers/katrina-dressler.jpg','Sculpture by Katrina Dressler');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('kyle-christopherson','Kyle Christopherson','Snohomish, WA','USA','Semi-Pro','Third-year competitor',null,'/images/carvers/kyle-christopherson.jpg','Sculpture by Kyle Christopherson');
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('riley-knaus','Riley Knaus','Coos Bay, OR','USA','Semi-Pro','Detail, style and artistic expression',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('terry-moss','Terry Moss','Turner, OR','USA','Semi-Pro','From miniature caricatures to big logs',null,null,null);
insert into public.carvers (slug,name,hometown,country,division,card_line,honor_badge,photo_path,photo_alt) values ('zane-wehmeyer','Zane Wehmeyer','Kansas City, MO','USA','Semi-Pro','Realism and naturalistic detail',null,'/images/carvers/zane-wehmeyer.jpg','Sculpture by Zane Wehmeyer');
insert into public.carver_years (carver_id, year, status) select id, 2026, 'Confirmed' from public.carvers;
insert into public.carver_years (carver_id, year, status) select id, 2027, 'Invited' from public.carvers;
update public.settings set featured_carver_ids = array(select id from public.carvers where slug in ('colby-herrington','rachael-mirth','ryan-anderson','bob-king','bill-baker','jacob-lucas') order by array_position(array['colby-herrington','rachael-mirth','ryan-anderson','bob-king','bill-baker','jacob-lucas']::text[], slug));

-- Sponsorship levels (2027)
insert into public.sponsorship_levels (name,price_label,price_amount,max_available,benefits,show_logo,on_poster,sort_order) values ('Presenting Sponsor','$10,000',10000,1,array['Top billing on every event poster','“Presented by” logo on the homepage, beside the championship logo','Featured in marketing emails, press releases and mailers','Logo on the official carver T-shirts','Prominent signage at the entrance and on the carver tent','Recognized from the stage multiple times every day']::text[],true,true,0);
insert into public.sponsorship_levels (name,price_label,price_amount,max_available,benefits,show_logo,on_poster,sort_order) values ('Pro Division Sponsor','$5,000',5000,1,array['Logo on the event poster','Named sponsor of the Pro division']::text[],true,true,1);
insert into public.sponsorship_levels (name,price_label,price_amount,max_available,benefits,show_logo,on_poster,sort_order) values ('Semi-Pro Division Sponsor','$2,500',2500,1,array['Logo on the event poster','Named sponsor of the Semi-Pro division']::text[],true,true,2);
insert into public.sponsorship_levels (name,price_label,price_amount,max_available,benefits,show_logo,on_poster,sort_order) values ('Community Sponsor','$1,000+',1000,null,array['Cash and/or in-kind goods and services','Name on the Sponsors page']::text[],true,false,3);
insert into public.sponsorship_levels (name,price_label,price_amount,max_available,benefits,show_logo,on_poster,sort_order) values ('[Level name — $500]','$500',500,null,array['Name on the Sponsors page']::text[],false,false,4);
insert into public.sponsorship_levels (name,price_label,price_amount,max_available,benefits,show_logo,on_poster,sort_order) values ('[Level name — $250]','$250',250,null,array['Name on the Sponsors page']::text[],false,false,5);

-- 2026 sponsors (legacy level names; no level_id)
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Douglas County Board of Commissioners','Title','Paid',0);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Southport Lumber','Gold','Paid',1);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'First Interstate Bank','Gold','Paid',2);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Star Rentals','Gold','Paid',3);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Oregon Log & Burl','Gold','Paid',4);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Sutherlin Sanitary','Silver','Paid',5);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Peterson Caterpillar','Silver','Paid',6);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Sugar Shack Bakery','Silver','Paid',7);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'101 Property Management','Bronze','Paid',8);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Creekside Crossing Apartments','Bronze','Paid',9);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Highwater Cafe & Market','Bronze','Paid',10);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Pizza To Go','Bronze','Paid',11);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Recreation Station','Bronze','Paid',12);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Two-Shy Brewing','Bronze','Paid',13);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'City of Reedsport','Bronze','Paid',14);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'First Community Credit Union','Bronze','Paid',15);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Moose Lodge','Bronze','Paid',16);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Port of Umpqua','Bronze','Paid',17);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Tide''s Inn Bar & Grill','Bronze','Paid',18);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Douglas Electric Cooperative','Community','Paid',19);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Farr''s Hardware – Coos Bay','Community','Paid',20);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Grayguns Inc.','Community','Paid',21);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Lions Club','Community','Paid',22);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Liz Adamo – Mal & Seitz Real Estate','Community','Paid',23);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'McKay''s Market','Community','Paid',24);
insert into public.sponsors (year,name,legacy_level,status,sort_order) values (2026,'Safeway','Community','Paid',25);

-- Schedule
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('weekday','7:30 – 10:15 a.m.','Main event carving','Carvers begin work on their competition sculptures.',false,0);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('weekday','10:30 a.m. – noon','Quick Carve','90 minutes, a fresh log, one finished piece — sold at the evening auction.',true,1);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('weekday','Noon – 1:00 p.m.','Lunch break',null,false,2);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('weekday','1:00 – 5:00 p.m.','Main event carving continues',null,false,3);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('weekday','5:30 p.m.','Live auction','Quick Carve pieces go to the highest bidder.',true,4);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('sunday','7:30 – 10:15 a.m.','Final push on main sculptures',null,false,0);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('sunday','10:30 a.m. – noon','Judging + final Quick Carve',null,true,1);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('sunday','Noon – 1:00 p.m.','Lunch break',null,false,2);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('sunday','2:00 – 3:00 p.m.','Final auction',null,true,3);
insert into public.schedule_items (day_type,time_label,title,description,highlight,sort_order) values ('sunday','4:00 p.m.','Awards ceremony','Champions crowned in the Pro and Semi-Pro divisions.',true,4);

-- Winners (known)
insert into public.winners (year,division,place,carver_name,carver_id) values (2025,'Pro',1,'Colby Herrington',(select id from public.carvers where name='Colby Herrington'));
insert into public.winners (year,division,place,carver_name,carver_id) values (2021,'Pro',1,'Ryan Anderson',(select id from public.carvers where name='Ryan Anderson'));
insert into public.winners (year,division,place,carver_name,carver_id) values (2021,'Pro',2,'Jacob Lucas',(select id from public.carvers where name='Jacob Lucas'));
insert into public.winners (year,division,place,carver_name,carver_id) values (2021,'Pro',3,'Bob King',(select id from public.carvers where name='Bob King'));
insert into public.winners (year,division,place,carver_name,carver_id) values (2021,'Semi-Pro',1,'Edwin Hutchison Jr.',(select id from public.carvers where name='Edwin Hutchison Jr.'));
insert into public.winners (year,division,place,carver_name,carver_id) values (2021,'Semi-Pro',2,'Jarrod Flowers',(select id from public.carvers where name='Jarrod Flowers'));
insert into public.winners (year,division,place,carver_name,carver_id) values (2021,'Semi-Pro',3,'Brandi Herber',(select id from public.carvers where name='Brandi Herber'));
commit;
