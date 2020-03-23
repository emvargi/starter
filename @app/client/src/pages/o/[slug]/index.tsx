import {
  ButtonLink,
  H1,
  Link,
  SharedLayout,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@app/components";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
} from "@app/graphql";
import { Button, Col, Empty, PageHeader, Row } from "antd";
import { NextPage } from "next";
import React, { FC } from "react";

const OrganizationPage: NextPage = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout title={organization?.name ?? slug} query={query}>
      {organizationLoadingElement || (
        <OrganizationPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
};

interface OrganizationPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationPageInner: FC<OrganizationPageInnerProps> = props => {
  const { organization } = props;

  return (
    <Row>
      <Col>
        <div>
          <PageHeader
            title={organization.name + " dashboard"}
            extra={
              organization.currentUserIsBillingContact ||
              organization.currentUserIsOwner
                ? [
                    <ButtonLink
                      key="settings"
                      href={`/o/${organization.slug}/settings`}
                      type="primary"
                    >
                      Settings
                    </ButtonLink>,
                  ]
                : null
            }
          />
          <Empty
            description={
              <span>
                Customize this page in
                <br />
                <code>@app/client/src/pages/o/[slug]/index.tsx</code>
              </span>
            }
          />
        </div>
      </Col>
    </Row>
  );
};

export default OrganizationPage;